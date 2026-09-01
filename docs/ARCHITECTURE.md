# Architecture Guide — The App Central Gateway Model

This document explains your updated **Central App Gateway** architecture in plain English.

---

## 🏛️ The Central App Gateway Architecture

In this architecture, **neither WhatsApp nor ChatGPT ever touch your raw database directly**. 

Instead, your **Sanctuary App Server** acts as the central brain and security guard. Everything connects directly to the App, and the App safely manages your Supabase database.

```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│  WhatsApp (Your Phone) │      │   Aryamaan Dashboard   │      │   ChatGPT / AI (MCP)   │
│  Fast message capture  │      │   (Web & Mobile PWA)   │      │ Mindful reflections    │
└───────────┬────────────┘      └───────────┬────────────┘      └───────────┬────────────┘
            │                               │                               │
            │ (Webhook)                     │ (REST API)                    │ (MCP / JSON-RPC)
            ▼                               ▼                               ▼
     ┌─────────────────────────────────────────────────────────────────────────────┐
     │                      ARYAMAAN SANCTUARY APP SERVER                          │
     │                      (Central Brain & Security Hub)                         │
     │                                                                             │
     │  * AI Intent Classifier (Diary, Quote, Idea, Todo, Mood)                    │
     │  * Etiquette Enforcer (Never saves conversational spam)                     │
     │  * Data Validator & Tag Formatter                                           │
     │  * 7 Guarded MCP Tools                                                      │
     └──────────────────────────────────────┬──────────────────────────────────────┘
                                            │
                                            │ (Safe, Authenticated Read/Write)
                                            ▼
                             ┌──────────────────────────────┐
                             │     Supabase Life Database   │
                             │ (Plus Local-First Fallback)  │
                             └──────────────────────────────┘
```

---

## 🛡️ Why Connecting to the App is Far Superior

### 1. Zero Risk of Database Corruption
* If ChatGPT were connected directly to raw database tables, a hallucination or bad SQL query could delete or corrupt your entries.
* By connecting to your **App Server**, ChatGPT is only allowed to use 7 strictly safe tools (`search_entries`, `create_entry`, `create_todo`, etc.). It has zero ability to run destructive raw database commands.

### 2. Smart Business Logic & Natural Language Classification
* When you text WhatsApp *"Quote: The obstacle is the way. — Marcus Aurelius"*, your **App Server** automatically cleans the text, extracts the author name, tags it `#Wisdom`, and categorizes it as a quote before saving.
* A raw database cannot do this on its own.

### 3. Enforces Your Personal Etiquette Rules
* The App Server enforces your rule: **ChatGPT should never save casual conversation banter automatically.**
* It validates that every saved item has a clear category, source (`whatsapp`, `chatgpt`, or `dashboard`), and timestamp.

### 4. Single Source of Truth & Universal Portability
* Whether you add a thought on your phone via WhatsApp, type it in your laptop browser, or ask ChatGPT to record a reflection, it all flows through the exact same pipeline into your sanctuary.
