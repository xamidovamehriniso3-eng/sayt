require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.env.CHAT_ID || '';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const profile = {
  name: '[Ismingiz]',
  role: 'Backend Dasturchiman',
  tagline: 'Node.js, Express.js, MongoDB va Telegram Botlar yaratish bo\'yicha mutaxassis.',
  email: 'hello@yourname.dev',
  github: 'https://github.com/xamidovamehriniso3-eng',
  linkedin: 'https://www.linkedin.com/in/yourname',
  telegram: 'https://t.me/yourname',
  skills: {
    languages: ['JavaScript', 'Node.js'],
    frameworks: ['Express.js', 'Telegraf.js', 'Node-telegram-bot-api'],
    databases: ['MongoDB', 'PostgreSQL', 'Redis'],
    tools: ['Git', 'GitHub', 'Docker', 'Postman', 'Swagger', 'Render']
  }
};

async function validateTelegramBot() {
  if (!BOT_TOKEN) {
    return {
      configured: false,
      status: 'not_configured',
      message: 'BOT_TOKEN mavjud emas.'
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const data = await response.json();

    if (!response.ok || !data.ok) {
      return {
        configured: false,
        status: 'invalid_token',
        message: data.description || 'Telegram bot token yaroqsiz.'
      };
    }

    return {
      configured: true,
      status: 'connected',
      username: data.result?.username || null,
      message: `Telegram bot ${data.result?.username || 'ishga tayyor'}`
    };
  } catch (error) {
    return {
      configured: false,
      status: 'error',
      message: 'Telegram API bilan bog\'lanishda xatolik yuz berdi.'
    };
  }
}

async function sendTelegramMessage(text) {
  if (!BOT_TOKEN || !CHAT_ID) {
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    return Boolean(data.ok);
  } catch (error) {
    console.error('Telegram xabar yuborishda xatolik:', error);
    return false;
  }
}

app.get('/api/health', async (req, res) => {
  const telegramStatus = await validateTelegramBot();

  res.json({
    ok: true,
    status: 'healthy',
    service: 'portfolio-api',
    timestamp: new Date().toISOString(),
    telegram: telegramStatus
  });
});

app.get('/api/profile', (req, res) => {
  res.json({ ok: true, data: profile });
});

app.get('/api/telegram-status', async (req, res) => {
  const telegramStatus = await validateTelegramBot();
  res.json({ ok: true, data: telegramStatus });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      ok: false,
      message: 'Iltimos, ism, email va xabar maydonlarini to\'ldiring.'
    });
  }

  console.log('Yangi xabar:', { name, email, message });

  const telegramStatus = await validateTelegramBot();
  let telegramSent = false;

  if (telegramStatus.configured && CHAT_ID) {
    const text = `\n<b>Yangi portfolio xabari</b>\n\n<b>Ism:</b> ${name}\n<b>Email:</b> ${email}\n\n<b>Xabar:</b> ${message}`;
    telegramSent = await sendTelegramMessage(text);
  }

  return res.status(200).json({
    ok: true,
    message: `Rahmat, ${name}! Xabaringiz qabul qilindi. Tez orada javob beraman.`,
    telegramSent
  });
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
