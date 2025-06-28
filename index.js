import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const APP_URL = process.env.BASE_URL;

app.use(express.static('public'));

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
                
                <meta property="fc:frame" content="vNext">
                <meta property="fc:frame:image" content="${APP_URL}/image.png">
                <meta property="fc:frame:button:1" content="Predict Higher ⬆️">
                <meta property="fc:frame:button:2" content="Predict Lower ⬇️">
                <meta property="fc:frame:post_url" content="${APP_URL}/vote">

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
                <meta property="fc:frame" content="vNext">
                <meta property="fc:frame:image" content="${APP_URL}/splash.png">
                <meta property="fc:frame:button:1" content="Thanks for voting!">
                <meta property="fc:frame:button:1:action" content="link">
                <meta property="fc:frame:button:1:target" content="https://warpcast.com/~/channel/nextday">
            </head>
        </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
