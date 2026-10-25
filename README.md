# Quotex Signal Lab — Fixed Dashboard with OTC Manual Mode

## Included
- Fixed homepage route: root `index.html` is served correctly.
- Mobile-friendly dashboard and candle chart with a live quote overlay (polls every 5 seconds when provider access is configured).\n- Candle-expiry countdown aligned to the selected timeframe, rather than a fixed 60-second reset.
- Twelve Data backend proxy with private server-side API key.
- Regular-market symbol/timeframe selection and technical indicators.
- OTC mode for user-provided/imported OHLC candles; does not invent an OTC feed.
- Side-by-side close/trend comparison for OTC and Twelve Data, with timestamp-alignment warning.
- Manual wins/losses and automatic historical candle-direction counter when refreshed data arrives.
- API health endpoint.

## Deploy from Android
1. Download and extract the ZIP.
2. Back up your GitHub repository first.
3. Upload/replace root `index.html`, `server.js`, `package.json`, `.gitignore`, and `README.md` in your `Quotexlap` repository. Do not place them inside another nested folder.
4. Render Settings: Build Command `npm install`; Start Command `npm start`; Root Directory blank if files are at repository root.
5. In Render Environment, set `TWELVEDATA_API_KEY` to your Twelve Data key. Do not put the key in GitHub, browser code, screenshots, or chat.
6. Deploy latest commit.
7. Test `/api/health`, `/api/market?symbol=EUR%2FUSD&interval=1min`, and `/api/price?symbol=EUR%2FUSD`.

## OTC reality
Twelve Data does not supply Quotex OTC prices. This ZIP adds an OTC tab that accepts candles pasted from an actual OTC source you verify. It does not claim a live OTC connection. To connect an actual OTC feed, a provider/API with documented permission and access is needed.

## Automatic results and risk
The automatic tracker is a basic historical candle-direction comparison, not brokerage trade execution. It is not a verified Quotex trade record and can be affected by candle timing, payout rules, stale candles, ties, and price-feed differences. It never places trades. No accuracy or profit is guaranteed. The displayed signal countdown now aligns to the next boundary of the selected chart timeframe (1m, 5m, 15m, 30m, 1h, 4h, or 1day) and shows the estimated candle-close time in UTC. This is a local visual estimate, not synchronized with Quotex trade expiry. Market data is not refreshed every 0.5 seconds.

## Expanded market selector and risk index
- Includes a larger list of regular forex pairs, the OTC pair names visible in the user's screenshots, crypto, commodities, and example stocks.
- OTC entries are explicitly manual-data only. They are blocked from Twelve Data queries to prevent displaying regular-market prices as Quotex OTC prices.
- Estimated Risk Index is a heuristic indicator based on volatility and signal alignment. It is not a losing probability, win probability, or guaranteed risk measurement.
- Twelve Data may not support every symbol or market on every plan; provider errors should be shown rather than replaced with invented prices.
\n\n## Chart refresh notes\nThe live quote overlay uses Twelve Data `/price` and polls every 5 seconds; provider limits, plan access, or network errors may prevent updates. Candle history refreshes only when Analyze market is clicked or the market/timeframe changes. The expiry countdown is a local timeframe countdown, not synced to Quotex trade expiry. Quotes and candles are third-party regular-market data, not Quotex OTC feed.\n

## Timeframes and win-rate display update

The selector includes provider-supported intervals: 1m, 5m, 15m, 30m, 45m, 1h, 2h, 4h, 8h, 1 day, 1 week and 1 month. The timer estimates the next UTC candle boundary. Win-rate percentages are calculated only from outcomes recorded by the app; they are not a forecast or a guarantee and automatic scoring is approximate. Sub-second 0.5-second market candles and Quotex OTC live data are not supplied by Twelve Data.
