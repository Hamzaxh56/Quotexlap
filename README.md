# Quotex Signal Lab — refreshed dashboard

Mobile-friendly market-analysis website using a Twelve Data backend proxy and a TradingView embed. The built-in Price action chart supports standard candlesticks and Heikin Ashi candles via the chart-type toggle.

## Run locally
1. Install Node.js 20+.
2. Run `npm install`.
3. Set `TWELVEDATA_API_KEY` in your environment (get a key from Twelve Data; keep it on the server, never in browser code).
4. Run `npm start` and open `http://localhost:10000`.

## Deploy on Render
- Create a Web Service from this folder/repository.
- Build command: `npm install`
- Start command: `npm start`
- Add environment variable `TWELVEDATA_API_KEY` with your own provider key.

## Important limits
- This is a technical-analysis dashboard, not an official Quotex integration and it does not place trades.
- The strict CALL/PUT filter requires strong indicator alignment; WAIT means no trade setup. A stricter filter can reduce signals but does not guarantee better outcomes.
- Win rate is only a rough local candle-follow-through score from signals observed by this app. It is not a validated backtest, not a win probability, and may not match Quotex's settlement rules. Test on a demo account and verify outcomes before risking money.
- Quotex OTC prices/candles are not supplied by Twelve Data or TradingView. There is no verified free public feed for Quotex's proprietary OTC candles in this project. OTC mode only analyzes candles you manually import from a source you trust; it cannot make fake data live.
- Regular forex feed prices may differ from Quotex quotes. Provider access and supported intervals depend on your API plan.
- Sub-second (0.5-second) market candles are not supported by the configured candle provider. Supported timeframe options are listed in the website.
- No tool can honestly promise 90%+ winning signals. Avoid real-money trades until you have independently tested the strategy over a meaningful sample.
