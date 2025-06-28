import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Убедитесь, что BASE_URL установлен в настройках Vercel
const APP_URL = process.env.BASE_URL;

app.use(express.static('public'));

// --- Получение цены BTC (без изменений) ---
async function getBTCPrice() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const data = await res.json();
    return data?.bitcoin?.usd ?? '...';
  } catch (err) {
    console.error('Error fetching BTC price:', err.message);
    return '...';
  }
}

// --- ШАГ 1: Начальный экран Mini App (с правильным расположением скрипта) ---
app.get('/', (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>NEXTDAY</title>
                <meta property="og:title" content="NEXTDAY: BTC Price Prediction">
                <meta property="og:image" content="${APP_URL}/image.png">
                <meta name="fc:frame" content="vNext">
                <meta name="fc:frame:image" content="${APP_URL}/image.png">
                <meta name="fc:frame:post_url" content="${APP_URL}/show_price">
                <meta name="fc:frame:button:1" content="▶️ Start Prediction">
            </head>
            <body>
                <h1>NEXTDAY</h1>
                
                <script type="module">
                  import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';
                  sdk.ready();
                </script>
            </body>
        </html>
    `;
    res.setHeader('Content-Type', 'text/html').status(200).send(html);
});

// --- ШАГ 2: Экран с ценой (вызывается после нажатия кнопки) ---
app.post('/show_price', async (req, res) => {
    const btcPrice = await getBTCPrice();
    const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>NEXTDAY</title>
                <meta name="fc:frame" content="vNext">
                <meta name="fc:frame:image:aspect_ratio" content="1:1" />
                <meta name="fc:frame:image" content="data:image/svg+xml,
                    <svg width='500' height='500' viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'>
                        <rect width='100%' height='100%' style='fill:rgb(25,25,25);' />
                        <text x='50%' y='40%' font-family='monospace' font-size='30px' fill='white' text-anchor='middle' dominant-baseline='middle'>Current BTC Price:</text>
                        <text x='50%' y='60%' font-family='monospace' font-size='70px' fill='white' text-anchor='middle' dominant-baseline='middle'>$${btcPrice}</text>
                    </svg>"
                />
                <meta name="fc:frame:button:1" content="Higher ⬆️">
                <meta name="fc:frame:button:2" content="Lower ⬇️">
                <meta name="fc:frame:button:3" content="Same ➖">
                <meta name="fc:frame:post_url" content="${APP_URL}/vote">
            </head>
        </html>
    `;
    res.setHeader('Content-Type', 'text/html').status(200).send(html);
});


// --- ШАГ 3: Экран благодарности (вызывается после прогноза) ---
app.post('/vote', (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Thanks!</title>
                <meta name="fc:frame" content="vNext">
                <meta name="fc:frame:image" content="${APP_URL}/splash.png">
                <meta name="fc:frame:button:1" content="Share your prediction!">
                <meta name="fc:frame:button:1:action" content="link">
                <meta name="fc:frame:button:1:target" content="https://warpcast.com/~/compose?text=I%20just%20predicted%20the%20BTC%20price%20on%20NEXTDAY!&embeds[]=${APP_URL}">
            </head>
        </html>
    `;
    res.setHeader('Content-Type', 'text/html').status(200).send(html);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
