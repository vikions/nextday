import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let guesses = {}; // В реальности — заменить на БД

async function getBTCPrice() {
  const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
  const data = await res.json();
  return data.bitcoin.usd;
}

app.get('/', async (req, res) => {
  const btcPrice = await getBTCPrice();
  res.set('Content-Type', 'text/html');
  res.send(`
    <html>
      <head>
        <meta property="og:title" content="📈 BTC Price Game" />
        <meta property="og:description" content="Сегодня: $${btcPrice}. Что будет завтра?" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${process.env.BASE_URL}/preview.png" />
        <meta property="fc:frame:button:1" content="Выше" />
        <meta property="fc:frame:button:2" content="Ниже" />
        <meta property="fc:frame:button:3" content="Так же" />
        <meta property="fc:frame:post_url" content="${process.env.BASE_URL}/frame" />
      </head>
    </html>
  `);
});

app.post('/frame', (req, res) => {
  // Warpcast не передает форму как обычный HTML <form>, так что здесь можно позже добавить кастомную обработку через Farcaster подписанные сообщения
  // Пока — просто отдаем фрейм ответа
  res.set('Content-Type', 'text/html');
  res.send(`
    <html>
      <head>
        <meta property="og:title" content="✅ Принято!" />
        <meta property="og:description" content="Мы сохранили твой прогноз!" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${process.env.BASE_URL}/thanks.png" />
      </head>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
