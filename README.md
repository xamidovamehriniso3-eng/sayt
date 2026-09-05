# Portfolio site — Telegram contact setup

1. Copy `.env.example` to `.env` and set values:

```
BOT_TOKEN=your_bot_token_here
CHAT_ID=your_telegram_chat_id_here
PORT=3000
```

2. Install deps and start server:

```bash
npm install
npm run dev
```

3. Open `http://localhost:3000` and submit the contact form. The site will POST to `/api/contact` and the server will forward the message to your Telegram chat via the bot.

Notes:
- Ensure your bot has been started (open chat with the bot) and you have the correct `CHAT_ID`.
- Node 18+ is recommended so `fetch` works in `server.js` without extra packages.
