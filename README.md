# Aryamaan Sanctuary (AA-portal) 🌿

A private, minimalist digital sanctuary for life management, wisdom, reflections, and somatic grounding.

Built with extreme simplicity, literary typography, and warm soothing aesthetics, connected seamlessly to **WhatsApp** and **ChatGPT** via a unified Supabase life database.

---

## 🏛️ Ecosystem Overview

* **Dashboard (Web & Mobile PWA)**: Your visual sanctuary at `http://localhost:5173/`.
* **WhatsApp Capture**: Message your private WhatsApp number naturally &rarr; auto-categorized into Diary, Quote, Idea, Todo, or Mood.
* **ChatGPT MCP Server**: Interact with your life database during AI conversations while respecting strict saving etiquette.
* **Supabase Life Database**: Single source of truth with 100% offline-first fallback.

---

## 📚 Complete Feature Documentation

All feature guides are documented in plain English in the `docs/` folder:

1. [Architecture & Ecosystem Guide](file:///c:/Users/AA/Documents/antigravity/delightful-noether/docs/ARCHITECTURE.md)
2. [Wisdom & Quotes Vault](file:///c:/Users/AA/Documents/antigravity/delightful-noether/docs/QUOTES_AND_WISDOM_VAULT.md)
3. [Mind Mirror & Emotional Grounding](file:///c:/Users/AA/Documents/antigravity/delightful-noether/docs/MIND_MIRROR_AND_REFLECTIONS.md)
4. [Somatic Nervous System Breath Guide](file:///c:/Users/AA/Documents/antigravity/delightful-noether/docs/SOMATIC_BREATH_GUIDE.md)
5. [WhatsApp Ingestion Setup](file:///c:/Users/AA/Documents/antigravity/delightful-noether/docs/WHATSAPP_INTEGRATION.md)
6. [ChatGPT & Claude MCP Integration](file:///c:/Users/AA/Documents/antigravity/delightful-noether/docs/CHATGPT_MCP_INTEGRATION.md)
7. [Data Backup, Privacy & Cloud Sync](file:///c:/Users/AA/Documents/antigravity/delightful-noether/docs/DATA_BACKUP_AND_PRIVACY.md)
8. [Work Log & Engineering Audit Trail](file:///c:/Users/AA/Documents/antigravity/delightful-noether/docs/WORK_LOG.md)

---

## 🚀 Running Locally

Both services are currently active:

```bash
# 1. Frontend Dashboard (React + Vite PWA)
npm run dev
# URL: http://localhost:5173/

# 2. Backend API, WhatsApp Webhook & MCP Server
cd server
npm run dev
# URL: http://localhost:3001/
```

---

## 🧪 Running Automated Tests

```bash
# Run 37 Backend & MCP Tests
cd server && npm test

# Run 52 Playwright Browser E2E Tests
npx playwright test tests/e2e/deep-50-suite.spec.ts
```
