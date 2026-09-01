# Aryamaan Sanctuary — Backend API, WhatsApp Ingestion & ChatGPT MCP Server

Unified backend connecting **WhatsApp &rarr; Dashboard &larr; ChatGPT** through a shared Supabase life database.

---

## 🚀 Quick Start

### 1. Install Dependencies & Build
```bash
cd server
npm install
npm run build
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env` and fill your credentials:
```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
GEMINI_API_KEY=AIzaSy...
WHATSAPP_VERIFY_TOKEN=aryamaan_sanctuary_secret_token
```
*(Note: If Supabase credentials are not provided, it automatically runs in high-speed local storage mode at `server/data/sanctuary_db.json`!)*

### 3. Start the Server
```bash
# Start HTTP API + WhatsApp Webhook
npm run dev

# Or run standalone MCP stdio server
npm run mcp
```

---

## 🤖 Connecting to ChatGPT / Claude / Cursor

### Claude Desktop / Cursor / Antigravity MCP Config
Add this to your MCP configuration file (e.g. `claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "aryamaan-sanctuary": {
      "command": "node",
      "args": ["c:/Users/AA/Documents/antigravity/delightful-noether/server/dist/mcp/server.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-key"
      }
    }
  }
}
```

---

## 📱 WhatsApp Webhook Setup

Point your Twilio WhatsApp Sandbox / Meta WhatsApp Cloud API webhook to:
```
https://your-domain.com/api/whatsapp/webhook
```

### Example Messages Processed:
* *"Today was actually a really good day."* &rarr; Auto-saved as `diary`
* *"Quote: The obstacle is the way. — Marcus Aurelius"* &rarr; Auto-saved as `quote`
* *"Todo: Call accountant tomorrow"* &rarr; Auto-saved as `todo` with due date
* *"Feeling 7/10 today. Much better than yesterday."* &rarr; Auto-saved as `mood`
* *"I've been thinking that maybe I should explore studying abroad."* &rarr; Auto-saved as `idea`
