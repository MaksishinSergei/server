// server/server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const BOT_TOKEN = "6300078459:AAF1ODD5Zey3-A5Sy_iyo0o81TLqR7wPuIs";
const CHAT_ID = "983744501";

app.post("/send-to-telegram", async (req, res) => {
  const { name, coming, text, agreement } = req.body;

  try {
    const message = `📌\nПодтверждение присутствия!\nФамилия и имя: ${name}\nСтатус: ${coming}\nВ составе: ${text}\nСогласие на обработку ПДн: ${agreement}`;
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Ошибка:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
