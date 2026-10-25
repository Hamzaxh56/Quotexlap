const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 10000);
const API_KEY = process.env.TWELVEDATA_API_KEY || "";
const CACHE_TTL_MS = 15000; // Cache provider calls to protect API credits/rate limits.
const cache = new Map();

app.disable("x-powered-by");
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "Quotex Signal Lab",
    providerConfigured: Boolean(API_KEY),
    provider: "Twelve Data",
    cacheTtlMs: CACHE_TTL_MS,
    note: "Twelve Data market data does not automatically represent Quotex OTC prices."
  });
});

const allowedIntervals = new Set(["1min", "5min", "15min", "30min", "45min", "1h", "2h", "4h", "8h", "1day", "1week", "1month"]);
app.get("/api/market", async (req, res) => {
  const symbol = String(req.query.symbol || "EUR/USD").trim().toUpperCase();
  const interval = String(req.query.interval || "1min").trim();
  const outputsize = Math.min(500, Math.max(30, Number(req.query.outputsize) || 100));

  if (!/^[A-Z0-9._/-]{2,30}$/.test(symbol)) {
    return res.status(400).json({ ok: false, error: "Invalid symbol." });
  }
  if (!allowedIntervals.has(interval)) {
    return res.status(400).json({
      ok: false,
      error: "Unsupported Twelve Data interval.",
      supportedIntervals: [...allowedIntervals],
      note: "0.5-second candles are not supported by this endpoint."
    });
  }
  if (!API_KEY) {
    return res.status(503).json({
      ok: false,
      error: "Twelve Data API key is not configured on the server.",
      setup: "In Render → your service → Environment, add TWELVEDATA_API_KEY with your key as the value. Never put the key in public/index.html or GitHub."
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

    const upstream = await fetch(url, { headers: { "Accept": "application/json" }, signal: AbortSignal.timeout(12000) });
    const body = await upstream.json().catch(() => ({}));

    if (!upstream.ok || body.status === "error" || body.code || !Array.isArray(body.values)) {
      const providerMessage = body.message || body.error || `Twelve Data returned HTTP ${upstream.status}`;
      const status = body.code === 429 ? 429 : 502;
      return res.status(status).json({
        ok: false,
        error: "Market data provider did not return candle data.",
        providerMessage,
        symbol,
        interval,
        note: "The selected symbol may not be supported by Twelve Data, or your plan/credits may not allow this request. OTC feeds are not guaranteed."
      });
    }

    const candles = body.values.map(v => ({
      datetime: v.datetime,
      open: Number(v.open),
      high: Number(v.high),
      low: Number(v.low),
      close: Number(v.close),
      volume: v.volume == null ? null : Number(v.volume)
    })).filter(c => [c.open,c.high,c.low,c.close].every(Number.isFinite)).reverse();

    const data = {
      ok: true,
      provider: "Twelve Data",
      symbol: body.meta?.symbol || symbol,
      interval,
      exchange: body.meta?.exchange || null,
      timezone: body.meta?.exchange_timezone || null,
      candles,
      latest: candles[candles.length - 1] || null,
      fetchedAt: new Date().toISOString(),
      cached: false,
      note: "Provider candles are not necessarily the same prices as Quotex OTC."
    };
    cache.set(cacheKey, { at: now, data });
    return res.json(data);
  } catch (err) {
    return res.status(502).json({
      ok: false,
      error: "Could not reach Twelve Data.",
      detail: err.name === "TimeoutError" ? "Provider request timed out." : "Network or provider error.",
      note: "Try again later and check Render logs. Do not share your API key."
    });
  }
});

app.use((_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Quotex Signal Lab listening on 0.0.0.0:${PORT}`);
});
