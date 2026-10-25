const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 10000);
const API_KEY = process.env.TWELVEDATA_API_KEY || "";
const CACHE_TTL_MS = 15000;
const cache = new Map();

app.disable("x-powered-by");
app.use(express.static(__dirname, { index: "index.html" }));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "Quotex Signal Lab",
    provider: "Twelve Data",
    providerConfigured: Boolean(API_KEY),
    cacheTtlMs: CACHE_TTL_MS,
    note: "Twelve Data prices are not necessarily the same as Quotex OTC prices."
  });
});

const allowedIntervals = new Set([
  "1min", "5min", "15min", "30min", "45min",
  "1h", "2h", "4h", "8h", "1day", "1week", "1month"
]);


app.get("/api/price", async (req, res) => {
  const symbol = String(req.query.symbol || "EUR/USD").trim().toUpperCase();
  if (!API_KEY) return res.status(503).json({ok:false,error:"TWELVEDATA_API_KEY is not configured on the server."});
  if (symbol.includes("(OTC)")) return res.status(400).json({ok:false,error:"Twelve Data does not provide Quotex OTC prices."});
  if (!/^[A-Z0-9._-]{2,24}(\/[A-Z0-9._-]{2,24})?$/.test(symbol)) return res.status(400).json({ok:false,error:"Invalid symbol."});
  try {
    const url = new URL("https://api.twelvedata.com/price");
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("apikey", API_KEY);
    const upstream = await fetch(url, {headers:{Accept:"application/json"}, signal:AbortSignal.timeout(8000)});
    const body = await upstream.json().catch(()=>({}));
    if (!upstream.ok || body.status === "error" || body.code || !Number.isFinite(Number(body.price))) {
      return res.status(502).json({ok:false,error:"Live quote unavailable.",providerMessage:body.message || body.code || "Provider did not return a price."});
    }
    res.json({ok:true,symbol,price:Number(body.price),fetchedAt:new Date().toISOString(),provider:"Twelve Data"});
  } catch (e) {
    res.status(502).json({ok:false,error:"Could not retrieve live quote."});
  }
});

app.get("/api/market", async (req, res) => {
  const symbol = String(req.query.symbol || "EUR/USD").trim().toUpperCase();
  const interval = String(req.query.interval || "1min").trim();
  const outputsize = Math.min(500, Math.max(30, Number(req.query.outputsize) || 100));

  if (!/^[A-Z0-9._-]{2,24}(\/[A-Z0-9._-]{2,24})?$/.test(symbol)) {
    return res.status(400).json({ ok: false, error: "Invalid symbol." });
  }
  if (!allowedIntervals.has(interval)) {
    return res.status(400).json({
      ok: false, error: "Unsupported Twelve Data interval.",
      supportedIntervals: [...allowedIntervals],
      note: "Market-data provider intervals are not 0.5-second candles."
    });
  }
  if (!API_KEY) {
    return res.status(503).json({
      ok: false,
      error: "Twelve Data API key is not configured on the server.",
      setup: "In Render, open your service → Environment and add TWELVEDATA_API_KEY with your key as the value."
    });
  }

  const cacheKey = `${symbol}|${interval}|${outputsize}`;
  const now = Date.now();
  const saved = cache.get(cacheKey);
  if (saved && now - saved.at < CACHE_TTL_MS) {
    return res.json({ ...saved.data, cached: true, cacheAgeMs: now - saved.at });
  }

  try {
    const url = new URL("https://api.twelvedata.com/time_series");
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("interval", interval);
    url.searchParams.set("outputsize", String(outputsize));
    url.searchParams.set("format", "JSON");
    url.searchParams.set("apikey", API_KEY);

    const upstream = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12000)
    });
    const body = await upstream.json().catch(() => ({}));

    if (!upstream.ok || body.status === "error" || body.code || !Array.isArray(body.values)) {
      return res.status(upstream.status >= 400 ? upstream.status : 502).json({
        ok: false,
        error: "Market data provider did not return candle data.",
        providerMessage: body.message || body.error || `Twelve Data returned HTTP ${upstream.status}`,
        symbol, interval,
        note: "The symbol may not be supported by your Twelve Data plan or credits may be exhausted."
      });
    }

    const candles = body.values.map(v => ({
      datetime: v.datetime,
      open: Number(v.open),
      high: Number(v.high),
      low: Number(v.low),
      close: Number(v.close),
      volume: v.volume == null ? null : Number(v.volume)
    })).filter(c => [c.open, c.high, c.low, c.close].every(Number.isFinite)).reverse();

    const data = {
      ok: true, provider: "Twelve Data",
      symbol: body.meta?.symbol || symbol,
      interval,
      exchange: body.meta?.exchange || null,
      timezone: body.meta?.timezone || null,
      candles,
      latest: candles[candles.length - 1] || null,
      fetchedAt: new Date().toISOString(),
      cached: false,
      note: "Provider prices are not necessarily the same as Quotex OTC prices."
    };
    cache.set(cacheKey, { at: now, data });
    return res.json(data);
  } catch (err) {
    return res.status(502).json({
      ok: false, error: "Could not reach Twelve Data.",
      detail: err.name === "TimeoutError" ? "Provider request timed out." : "Network or provider error.",
      note: "Check Render logs and API plan/credits. Never share your API key."
    });
  }
});

// Serve the homepage from the repository root (the uploaded index.html location).
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Quotex Signal Lab listening on port ${PORT}`);
});
