import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

// --- Получение цены (без изменений) ---
let cachedBTCPrice = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

async function getBTCPrice() {
  const now = Date.now();
  if (cachedBTCPrice && (now - lastFetchTime) < CACHE_TTL) {
    return cachedBTCPrice;
  }
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const data = await res.json();
    if (!data?.bitcoin?.usd) throw new Error('Unexpected API response structure');
    cachedBTCPrice = data.bitcoin.usd;
    lastFetchTime = now;
    return cachedBTCPrice;
  } catch (err) {
    console.error('Error fetching BTC price:', err.message);
    return cachedBTCPrice ?? '...';
  }
}

// --- ШАГ 1: Начальный фрейм (отвечает мгновенно) ---
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>NEXTDAY - BTC Price Game</title>
        <meta property="og:title" content="📈 NEXTDAY - BTC Price Game" />
        <meta property="og:image" content="${process.env.BASE_URL}/image.png" />
        <meta name="fc:frame:image" content="${process.env.BASE_URL}/image.png" />
        <meta name="fc:frame" content="vNext" />
        <meta name="fc:frame:post_url" content="${process.env.BASE_URL}/show-price" />
        <meta name="fc:frame:button:1" content="Узнать цену и сделать прогноз" />
      </head>
      <body><h1>NEXTDAY - BTC Price Game</h1></body>
    </html>
  `);
});

// --- ШАГ 2: Показать фрейм с ценой (здесь мы ждем ответа от API) ---
app.post('/show-price', async (req, res) => {
  const btcPrice = await getBTCPrice();
  res.set('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>NEXTDAY - BTC Price Game</title>
        <meta property="og:title" content="📈 NEXTDAY - BTC Price Game" />
        <meta property="og:image" content="${process.env.BASE_URL}/image.png" />
        <meta name="fc:frame:image" content="${process.env.BASE_URL}/image.png" />
        <meta name="fc:frame" content="vNext" />
        <meta name="fc:frame:post_url" content="${process.env.BASE_URL}/frame" />
        <meta name="fc:frame:button:1" content="Higher ⬆️" />
        <meta name="fc:frame:button:2" content="Lower ⬇️" />
        <meta name="fc:frame:button:3" content="Same ➖" />
        <meta http-equiv="refresh" content="0; url=data:text/html,
          <meta name='fc:frame:image' content='data:image/svg+xml,<svg width=\\"1200\\" height=\\"630\\" viewBox=\\"0 0 1200 630\\" xmlns=\\"http://www.w3.org/2000/svg\\"><rect width=\\"100%\\" height=\\"100%\\" style=\\"fill:rgb(25,25,25);\\" /><text x=\\"50%\\" y=\\"50%\\" font-family=\\"monospace\\" font-size=\\"80px\\" fill=\\"white\\" text-anchor=\\"middle\\" dominant-baseline=\\"middle\\">BTC: $${btcPrice}</text></svg>' />
        "/>
      </head>
      <body><h1>Current price: $${btcPrice}</h1></body>
    </html>
  `);
});

// --- ШАГ 3: Обработка прогноза (без изменений) ---
app.post('/frame', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Thanks!</title>
        <meta property="og:title" content="✅ Thanks for your prediction!" />
        <meta property="og:image" content="${process.env.BASE_URL}/splash.png" />
        <meta name="fc:frame" content="vNext" />
        <meta name="fc:frame:image" content="${process.env.BASE_URL}/splash.png" />
        <meta name="fc:frame:button:1" content="See on Twitter" />
        <meta name="fc:frame:button:1:action" content="link" />
        <meta name="fc:frame:button:1:target" content="https://twitter.com/grafini_eth" />
      </head>
      <body><h1>Thanks!</h1></body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
