# Quotex Signal Lab — Fixed Dashboard

## What is included
- Mobile-friendly dark trading dashboard.
- Homepage served from the repository root, fixing the previous `public/index.html` path mismatch.
- `/api/health` status endpoint.
- `/api/market` Twelve Data proxy; API key stays on the server.
- Candle chart, EMA 9/21, SMA 20, RSI 14, MACD, Bollinger range, CALL/PUT/WAIT rule-based assessment.
- One-minute UI countdown and manual win/loss tracker.
- Clear provider-status and error messages.

## Deploy to Render from Android
1. Download and extract this ZIP.
2. In your GitHub `Quotexlap` repository, back up existing files first.
3. Upload/replace the root `index.html`, `server.js`, and `package.json` with these files. Keep the same repository root (do not put them inside an extra nested folder).
4. Render Dashboard → your web service → Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: blank if the files are at repository root.
5. Render → Environment: add `TWELVEDATA_API_KEY` with your Twelve Data API key as its value. Do not put the key in GitHub, HTML, screenshots, or chat.
6. Save changes and deploy the latest commit.

## Test
- `https://YOUR-SERVICE.onrender.com/` — dashboard homepage
- `https://YOUR-SERVICE.onrender.com/api/health` — server status and whether API key is configured
- `https://YOUR-SERVICE.onrender.com/api/market?symbol=EUR%2FUSD&interval=1min` — provider candle response (requires a valid server key)

## Honest limitations
- Twelve Data does not provide Quotex OTC prices. Its prices can differ from Quotex, especially OTC instruments.
- The timer is a visual countdown only; it is not synced to Quotex candle expiry.
- This is a basic rule-based indicator assessment, not a trained AI model. It cannot promise 90% accuracy or profitable trades.
- Market data refreshes on demand, with a 15-second backend cache. It is not 0.5-second market data.
- Symbol availability and API limits depend on your Twelve Data plan.
