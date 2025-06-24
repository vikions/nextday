import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Раздача статики (preview.png, thanks.png и др.)
app.use(express.static('public'));

// Редирект для Farcaster верификации
app.get('/.well-known/farcaster.json', (req, res) => {
  res.redirect(307, 'https://api.farcaster.xyz/miniapps/hosted-manifest/0197923c-a43a-7b7e-5a57-4e5039917150');
});

// Кеширование цены BTC
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
    return cachedBTCPrice ?? 12345;
  }
}

// Главная страница с фреймом
// ВРЕМЕННЫЙ ОТЛАДОЧНЫЙ КОД ДЛЯ ГЛАВНОЙ СТРАНИЦЫ
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Frame Debug</title>
        <meta property="og:title" content="Frame Debug" />
        <meta property="og:image" content="${process.env.BASE_URL}/preview.png" />

        <meta name="fc:frame" content="vNext" />
        <meta name="fc:frame:image" content="${process.env.BASE_URL}/preview.png" />
        <meta name="fc:frame:button:1" content="Click me" />
        <meta name="fc:frame:post_url" content="${process.env.BASE_URL}/frame" />
      </head>
      <body>
        <h1>This is a debug frame.</h1>
      </body>
    </html>
  `);
});

// Обработка клика по кнопкам фрейма
app.post('/frame', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(`
    <html>
      <head>
        <meta property="og:title" content="✅ Got it!" />
        <meta property="og:description" content="Your guess has been recorded!" />
        <meta name="fc:frame" content="vNext" />
        <meta name="fc:frame:image" content="${process.env.BASE_URL}/thanks.png" />
      </head>
      <body style="font-family: sans-serif; text-align: center; margin-top: 2em;">
        <h1>Thanks for guessing!</h1>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
