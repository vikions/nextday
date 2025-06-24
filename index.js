import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Убедитесь, что BASE_URL установлен в настройках Vercel
const APP_URL = process.env.BASE_URL;

// Раздача статических файлов из папки 'public'
app.use(express.static('public'));

// --- Главный экран Mini App ---
// Отвечает мгновенно, содержит только базовые интерактивные элементы.
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
            </head>
            <body>
                <h1>NEXTDAY - Will BTC be higher or lower tomorrow?</h1>
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
                <meta name="fc:frame:button:1" content="Thanks for voting!">
                <meta name="fc:frame:button:1:action" content="link">
                <meta name="fc:frame:button:1:target" content="https://warpcast.com/~/channel/nextday">
            </head>
        </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
