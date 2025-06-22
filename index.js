import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || 'https://nextday-frame.onrender.com';

// Добавляем Cache-Control на все ответы
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=60');
  next();
});

// Статическая раздача файлов из public/
app.use(express.static('public'));

// Farcaster well-known redirect
app.get('/.well-known/farcaster.json', (req, res) => {
  res.redirect(307, 'https://api.farcaster.xyz/miniapps/hosted-manifest/0197923c-a43a-7b7e-5a57-4e5039917150');
});

// Получение текущей цены BTC
async function getBTCPrice() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const data = await res.json();
    if (!data?.bitcoin?.usd) throw new Error('Unexpected API response structure');
    return data.bitcoin.usd;
  } catch (err) {
    console.error('Error fetching BTC price:', err.message);
    return 12345; // fallback
  }
}

// Главная страница с Frame
app.get('/', async (req, res) => {
  const btcPrice = await getBTCPrice();
  res.set('Content-Type', 'text/html');
  res.send(`
    <html>
      <head>
        <meta property="og:title" content="📈 BTC Price Game" />
        <meta property="og:description" content="Сегодня: $${btcPrice}. Что будет завтра?" />
        <meta property="og:image" content="${baseUrl}/preview.png" />

        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${baseUrl}/preview.png" />
        <meta property="fc:frame:button:1" content="Higher" />
        <meta property="fc:frame:button:2" content="Lower" />
        <meta property="fc:frame:button:3" content="Same" />
        <meta property="fc:frame:post_url" content="${baseUrl}/frame" />
      </head>
      <body style="font-family: sans-serif; text-align: center; margin-top: 2em;">
        <h1>📈 BTC Price Game</h1>
        <p>Today's BTC price: <strong>$${btcPrice}</strong></p>
        <p>Open this in Warpcast to make your guess!</p>
      </body>
    </html>
  `);
});

// Обработка клика на кнопку
app.post('/frame', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(`
    <html>
      <head>
        <meta property="og:title" content="✅ Got it!" />
        <meta property="og:description" content="Your guess has been recorded!" />
        <meta property="og:image" content="${baseUrl}/thanks.png" />

        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${baseUrl}/thanks.png" />
      </head>
      <body style="font-family: sans-serif; text-align: center; margin-top: 2em;">
        <h1>Thanks for guessing!</h1>
      </body>
    </html>
  `);
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
