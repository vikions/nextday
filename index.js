import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { FrameRequest, getFrameHtmlResponse } from "frames.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));

let latestPrice = null;

async function getBTCPrice() {
  const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
  const data = await response.json();
  return data.bitcoin.usd;
}

app.get("/", async (req, res) => {
  latestPrice = await getBTCPrice();

  const html = getFrameHtmlResponse({
    buttons: [
      { label: "📈 BTC будет выше", action: "post" },
      { label: "📉 BTC будет ниже", action: "post" },
    ],
    image: {
      src: `https://dummyimage.com/600x400/000/fff&text=Current+BTC:+$${latestPrice}`,
    },
    postUrl: `${process.env.BASE_URL}/submit`,
  });

  res.send(html);
});

app.post("/submit", async (req, res) => {
  const body = await FrameRequest.parse(req);

  const choice = body.buttonIndex === 0 ? "выше" : "ниже";

  const html = getFrameHtmlResponse({
    image: {
      src: `https://dummyimage.com/600x400/000/fff&text=Ты выбрал: BTC будет ${choice}!`,
    },
    buttons: [{ label: "Назад", action: "post" }],
    postUrl: `${process.env.BASE_URL}`,
  });

  res.send(html);
});

app.listen(port, () => {
  console.log(`NextDay running at http://localhost:${port}`);
});
