# WhatsApp Ingestion Guide (Connecting to App Server)

This guide explains how your WhatsApp messages are captured by your **Sanctuary App Server** and safely stored into your life database.

---

## 🔒 The Flow

```
WhatsApp (Your Phone)  ──────►  Sanctuary App Webhook  ──────►  Supabase Database
 (Natural Messages)             (AI Intent Classification)        (Secure Storage)
```

By connecting WhatsApp to your **App Webhook** (`/api/whatsapp/webhook`):
1. You can text in **100% natural language** (no bot commands needed).
2. The App analyzes the context and automatically classifies it into **Diary**, **Quote**, **Idea**, **To-do**, or **Mood Check-in**.
3. It retains the original message, sets `source = 'whatsapp'`, and returns a quiet confirmation (e.g. `🌿 Saved to Sanctuary (Diary)`).

---

## 📱 Supported Examples

* *"Today was actually a really good day."* &rarr; Auto-saved as `diary`
* *"Quote: The obstacle is the way. — Marcus Aurelius"* &rarr; Auto-saved as `quote` (extracts text & author)
* *"Todo: Call accountant tomorrow"* &rarr; Auto-saved as `todo` (extracts due date)
* *"Feeling 7/10 today. Much better than yesterday."* &rarr; Auto-saved as `mood`
* *"I've been thinking that maybe I should explore studying abroad."* &rarr; Auto-saved as `idea`

---

## ⚙️ Connecting WhatsApp / Twilio to the App

Point your webhook to your Sanctuary App Server:
```
POST http://localhost:3001/api/whatsapp/webhook
```

### Verification Challenge Endpoint (Meta Cloud API)
```
GET http://localhost:3001/api/whatsapp/webhook
```
*(Uses `WHATSAPP_VERIFY_TOKEN` configured in your server `.env`)*
