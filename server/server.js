//// server/server.js
//const express = require("express");
//const cors = require("cors");
//const axios = require("axios");

//const app = express();
//const PORT = 3001;

//app.use(cors());
//app.use(express.json());

//const BOT_TOKEN = "8114128160:AAHz1ohMPE_TvRcHHtkOcUIO2jSux9K-csM";
//const CHAT_ID = "983744501";

//app.post("/send-to-telegram", async (req, res) => {
//  const { name, coming, together, agreement } = req.body;

//  try {
//    const message = `📌\nПодтверждение присутствия!\nФИО: ${name}\nСтатус: ${coming}\nВ паре (ФИО): ${together}\nСогласие на обработку ПДн: ${agreement}`;
//    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
//      chat_id: CHAT_ID,
//      text: message,
//    });
//    res.json({ success: true });
//  } catch (error) {
//    console.error("Ошибка:", error);
//    res.status(500).json({ error: "Ошибка сервера" });
//  }
//});

//app.listen(PORT, () => {
//  console.log(`Сервер запущен на http://localhost:${PORT}`);
//});
const express = require("express");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const axios = require("axios");
const helmet = require("helmet");

// Инициализация Express
const app = express();
const PORT = 8443; // Стандартный HTTPS порт

// Настройки безопасности
app.use(helmet());
app.use(
  cors({
    origin: ["https://artemanddasha.ru", "https://www.artemanddasha.ru"],
    methods: ["POST", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));

// Конфигурация SSL (замените пути на свои)
const sslOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/artemanddasha.ru/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/artemanddasha.ru/fullchain.pem"),
  minVersion: "TLSv1.2", // Минимальная версия TLS
};
// Telegram Bot конфигурация
const BOT_TOKEN =
  process.env.BOT_TOKEN || "8114128160:AAHz1ohMPE_TvRcHHtkOcUIO2jSux9K-csM";
const CHAT_ID = process.env.CHAT_ID || "983744501";

// Middleware для логирования
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Роут для отправки в Telegram
app.post("/send-to-telegram", async (req, res) => {
  try {
    // Валидация входных данных
    const { name, coming, text, agreement } = req.body;
    if (!name || !coming) {
      return res
        .status(400)
        .json({ error: "Необходимо указать имя и статус присутствия" });
    }
    // Формирование сообщения
    const message = `📌\nПодтверждение присутствия!\nФИО: ${name}\nСтатус: ${coming}\nВ паре (ФИО): ${together}\nСогласие на обработку ПДн: ${agreement}`;
    // Отправка в Telegram
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      },
      {
        timeout: 5000, // Таймаут 5 секунд
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Ошибка:", error);
    res.status(500).json({
      error: "Ошибка сервера",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: "Ресурс не найден" });
});

// Создание HTTPS сервера
const server = https.createServer(sslOptions, app);

// Запуск сервера
server.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTPS сервер запущен на https://artemanddasha.ru`);
});

// Перенаправление HTTP -> HTTPS (опционально)
if (process.env.REDIRECT_HTTP === "true") {
  const http = require("http");
  http
    .createServer((req, res) => {
      res.writeHead(301, {
        Location: `https://artemanddasha.ru${req.url}`,
      });
      res.end();
    })
    .listen(80);
}

// Обработка ошибок процесса
process.on("unhandledRejection", (err) => {
  console.error("Необработанное исключение:", err);
});
