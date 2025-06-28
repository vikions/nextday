import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Убедитесь, что BASE_URL установлен в настройках Vercel
const APP_URL = process.env.BASE_URL;

// Раздача статики (картинок) из папки 'public'
app.use(express.static('public'));

// --- КЛЮЧЕВАЯ ЧАСТЬ: РЕДИРЕКТ НА ВАШ НОВЫЙ МАНИФЕСТ ---
app.get('/.well-known/farcaster.json', (req, res) => {
  res.redirect(307, 'https://api.farcaster.xyz/miniapps/hosted-manifest/0197a24f-2497-71bd-264e-9f7afe182592');
});

// --- Главный экран Mini App ---
app.get('/', (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <title>NEXTDAY</title>
                <meta property="og:title" content="NEXTDAY: BTC Price Prediction">
                <meta property="og:image" content="${APP_URL}/image.png">
                
                <meta name="fc:frame" content="vNext">
                <meta name="fc:frame:image" content="${APP_URL}/image.png">
                <meta name="fc:frame:button:1" content="Predict Higher ⬆️">
                <meta name="fc:frame:button:2" content="Predict Lower ⬇️">
                <meta name="fc:frame:post_url" content="${APP_URL}/vote">

                <script type="module">
                  import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';
                  sdk.ready();
                </script>
            </head>
            <body>
                <h1>Will BTC be higher or lower tomorrow?</h1>
            </body>
        </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
});

// --- Экран после нажатия кнопки ---
app.post('/vote', (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Thanks!</title>
                <meta name="fc:frame" content="vNext">
                <meta name="fc:frame:image" content="${APP_URL}/splash.png">
                <meta name="fc:frame:button:1" content="Done!">
            </head>
        </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
