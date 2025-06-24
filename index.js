import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Раздача статических файлов (image.png и др.) из папки 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- Манифест ---
// Эта часть нужна, если у вас НЕТ статического файла farcaster.json. 
// Если он есть в /public/.well-known/, то этот код не выполняется. Оставляем на всякий случай.
app.get('/.well-known/farcaster.json', (req, res) => {
  res.redirect(307, 'https://api.farcaster.xyz/miniapps/hosted-manifest/0197a116-5771-1df2-118e-c84717befb4c');
});

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

// --- Главная страница с фреймом ---
// Включает все исправления + SDK
// Финальная версия для Mini App (без кнопок на старте)
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>NEXTDAY - BTC Price Game</title>
        <meta property="og:title" content="📈 NEXTDAY - BTC Price Game" />
        <meta property="og:image" content="${process.env.BASE_URL}/image.png" />
        
        <meta name="fc:frame" content="vNext" />
        <meta name="fc:frame:image" content="${process.env.BASE_URL}/image.png" />
        
        <script type="module">
          import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';
          sdk.ready();
        </script>
      </head>
      <body>
        <h1>📈 NEXTDAY - BTC Price Game</h1>
        <p>This is a Farcaster Mini App.</p>
      </body>
    </html>
  `);
});
// --- Обработка клика по кнопкам фрейма ---
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
