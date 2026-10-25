# Quotex Signal Lab — Render backend starter

## Included
- Express server that binds to `0.0.0.0` and `process.env.PORT` (Render-compatible).
- `/api/health` status endpoint.
- `/api/market?symbol=EUR%2FUSD&interval=1min` Twelve Data time-series endpoint.
- Twelve Data API key read only from `TWELVEDATA_API_KEY` server environment variable.
- 15-second server-side response cache to reduce API-credit/rate-limit usage.
- Mobile-friendly dashboard with EMA 9/21, SMA 20, Supertrend, RSI, MACD, Bollinger Bands, fast analysis and 1-minute timer.

## Deploy to Render from Android
1. Upload the contents of this ZIP to the root of your GitHub repository. Ensure `package.json`, `server.js`, and `public/index.html` are at the repository root / expected paths.
2. In Render, open your existing **Web Service**. Set:
   - Build Command: `npm install`
   - Start Command: `npm start`
3. In Render → Environment → Add Environment Variable:
   - Key: `TWELVEDATA_API_KEY`
   - Value: your private Twelve Data API key
   Do not put the key in HTML, GitHub, screenshots, or chat.
4. Save and deploy. Check `https://YOUR-SERVICE.onrender.com/api/health`.
5. It should show `providerConfigured: true` once the key is set. Then open the homepage and press “Fetch market data”.

## Important limitations
- Twelve Data supports documented intervals such as 1min, 5min, 15min, 30min, 45min, 1h, 2h, 4h, 8h, 1day, 1week, 1month. It does not provide 0.5-second candles through this endpoint.
- The UI may be responsive at 500ms intervals, but actual market candles refresh at the provider/cache cadence. The server cache is 15 seconds to conserve API credits.
- Twelve Data's regular market data does not mean the same thing as Quotex OTC data. OTC symbols/prices may be unsupported and cannot be assumed equivalent.
- The indicator agreement score is NOT a probability or verified win rate. No 90% accuracy is promised. Do not use this as a guaranteed-profit bot.
- If Render already hosts a static site or a different app, changing its start command and file layout may replace its current service. Keep a backup before replacing files.
