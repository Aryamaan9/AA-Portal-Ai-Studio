# Aryamaan Sanctuary (AA-portal) — AI Agent & Developer Handoff Guide

> **Notice for Future Agents & Engineers**: This document provides a complete technical handover, architectural invariants, component catalog, testing protocol, and common pitfalls for the Aryamaan Sanctuary repository.

---

## 1. Project Overview & Mission

**Aryamaan Sanctuary (AA-portal)** is a private, minimalist digital sanctuary and personal life operating system combining:
1. **Sanctuary Home Landing**: Daily Anchor quote hero, Mind Mirror emotional check-in with mood chips, and live wisdom preview.
2. **Companion AI Studio**: Claude / ChatGPT Projects-style sidebar with Notebooks/Projects, chat threads, floating `...` dropdown options (Rename, Move to Project, Delete), and universal BYOK AI support.
3. **Wisdom & Quotes Vault**: Curated quote library featuring **5 distinct UX reading modes** (Zen Reader Deck, Literary Manuscript Stack, Theme Shelves, Minimalist Focus Grid, Infinite Stream) + 4-field fast quote capture.
4. **Physical Moleskine Journal**: Authentic 3-section ruled paper journal (Raw Stream, Polished Essence, Key Highlights) with red margin guide, spine gutter shadow, and AI thought polish.
5. **Central App Gateway & MCP**: Node.js/Express backend exposing 7 guarded MCP tools for ChatGPT/Claude, plus WhatsApp webhook with natural language classification.

---

## 2. Directory Structure & File Map

```
delightful-noether/
├── docs/                               # Comprehensive plain-English documentation
│   ├── AGENT_HANDOFF_GUIDE.md          # Master agent blueprint & handover guide
│   ├── ARCHITECTURE.md                 # Central App Gateway specification
│   ├── BYOK_LLM_INTEGRATION.md         # OpenRouter, Gemini, Groq, local Ollama BYOK setup
│   ├── CHATGPT_MCP_INTEGRATION.md      # ChatGPT / Claude Desktop MCP integration guide
│   ├── DATA_BACKUP_AND_PRIVACY.md      # Local-first storage and Supabase backup
│   ├── DIARY_AND_REFLECTIONS.md        # 3-section physical notebook architecture
│   ├── LIFE_HORIZONS_AND_PLANS.md      # 3-horizon life planning specification
│   ├── MIND_MIRROR_AND_REFLECTIONS.md  # Somatic / ACT emotional reflection engine
│   ├── QUOTES_AND_WISDOM_VAULT.md      # 5 quote UX reading modes specification
│   ├── SOMATIC_BREATH_GUIDE.md         # 4-4-4-4 Box Breathing visual guide
│   ├── WHATSAPP_INTEGRATION.md         # WhatsApp webhook & NLP classification
│   └── WORK_LOG.md                     # Engineering audit trail and phase log
├── server/                             # Backend API, MCP Gateway & WhatsApp Webhook
│   ├── src/
│   │   ├── db.ts                       # Dual-mode local JSON / Supabase DB driver
│   │   ├── index.ts                    # Express server entry point (port 3001)
│   │   ├── types.ts                    # Backend TypeScript interfaces
│   │   ├── mcp/
│   │   │   ├── server.ts               # MCP JSON-RPC protocol implementation
│   │   │   └── tools.ts                # 7 guarded MCP tools definitions & handlers
│   │   └── whatsapp/
│   │       ├── classifier.ts           # Natural language rule & intent classifier
│   │       └── webhook.ts              # WhatsApp inbound webhook listener
│   ├── tests/
│   │   └── api-mcp-tests.ts            # 37 backend MCP & classification unit tests
│   └── package.json
├── src/                                # React 18 Frontend Dashboard
│   ├── components/
│   │   ├── common/                     # Shared modal components (Breath, Contemplate, Settings, WhatsApp Sim)
│   │   ├── companion/                  # CompanionView.tsx (Projects, Chat, Dropdowns, Floating Dock)
│   │   ├── diary/                      # DiaryNotebook.tsx, DiaryCard.tsx, ThreeSectionNote.tsx
│   │   ├── layout/                     # SidebarNav.tsx, TopHeader.tsx, MobileNav.tsx, LayoutSwitcherBar.tsx
│   │   ├── quotes/                     # QuotesVault.tsx (5 UX reading modes), FastQuoteCapture.tsx, QuoteCard.tsx
│   │   └── sanctuary/                  # SanctuaryHome.tsx (Daily Anchor, Mind Mirror, Preview Grid)
│   ├── context/
│   │   ├── DataContext.tsx             # Master React state for quotes, diary, projects, and chat
│   │   └── ThemeContext.tsx            # 8 Color themes & 4 Layout structure presets
│   ├── services/
│   │   ├── companionService.ts         # Multi-turn chat persistence & thread management
│   │   ├── diaryService.ts             # 3-section diary entry management
│   │   ├── llm.ts                      # Universal BYOK AI client (OpenRouter, Gemini, Groq, Ollama)
│   │   ├── reflection.ts               # Mind mirror grounding & ACT reflection helpers
│   │   └── storage.ts                  # LocalStorage adapter with esbuild compatibility stubs
│   ├── types/
│   │   └── index.ts                    # Core TypeScript models (Quote, DiaryEntry, Project, ChatSession)
│   ├── App.tsx                         # Main App layout dispatcher
│   ├── index.css                       # Global design system tokens & theme definitions
│   └── main.tsx                        # React DOM mounting entry
├── tests/                              # Automated test suites
│   ├── e2e/
│   │   ├── deep-50-suite.spec.ts       # 52 comprehensive Playwright E2E UI & responsive tests
│   │   └── sanctuary.spec.ts           # Core smoke test suite
│   └── ui-e2e.spec.ts
├── playwright.config.ts                # Playwright configuration
├── package.json                        # Frontend dependencies & scripts
└── vite.config.ts                      # Vite build configuration
```

---

## 3. Critical Engineering Rules & Invariants

Incoming agents must adhere strictly to these non-negotiable guidelines:

### Rule 1: Zero CSS Breakage / Defense-in-Depth Styling
- Core views (`CompanionView.tsx`, `SanctuaryHome.tsx`, `QuotesVault.tsx`, `ThreeSectionNote.tsx`) contain **embedded `<style>` blocks** with explicit CSS variable fallbacks.
- **NEVER remove these embedded `<style>` blocks**. They ensure that even during hot-module reloading or network latency, the visual UI remains 100% styled, pristine, and immune to FOUC.

### Rule 2: Vite esbuild Scanner Compatibility
- `src/services/storage.ts` contains export stubs (`loadReflections`, `saveReflections`, `loadTodos`, `saveTodos`, `loadGoals`, `saveGoals`).
- **NEVER delete these export stubs**. Vite's esbuild dependency scanner relies on them to avoid triggering invalidation cascades across `DataContext.tsx`.

### Rule 3: Windows Shell Execution
- On this Windows environment, PowerShell execution policies require running npm and development commands via `cmd.exe /c` (e.g. `cmd.exe /c npm run dev`).

### Rule 4: Mandatory 100% Test Passing
- Every code change must be verified against both automated suites:
  1. `cmd.exe /c npx playwright test tests/e2e/deep-50-suite.spec.ts --project=desktop-chrome` -> **52 / 52 PASSED**
  2. `cmd.exe /c npx tsx server/tests/api-mcp-tests.ts` -> **37 / 37 PASSED**

---

## 4. Theme & Layout System

The application supports **8 nature color palettes** and **4 layout modes** configured via `ThemeContext.tsx` and `index.css`:

### 8 Color Themes:
1. `theme-sage` — Grounded Sage (Calm earthy sage green & soft parchment)
2. `theme-emerald` — Forest Emerald (Deep botanical emerald)
3. `theme-ocean` — Ocean Teal (Deep tranquil sea & cyan)
4. `theme-aquamarine` — Misty Aquamarine (Airy coastal mist)
5. `theme-midnight` — Midnight Cobalt (Dark navy & electric blue)
6. `theme-lavender` — Twilight Lavender (Dusk violet & warm plum)
7. `theme-parchment` — Warm Parchment (Classical warm paper & sepia)
8. `theme-hearth` — Dark Hearth (Moody dark charcoal & forest emerald)

### 4 Layout Modes:
1. `layout-sidebar` — Classic Left Sidebar Rail
2. `layout-centered` — Centered Editorial Notebook
3. `layout-split` — Split-Pane Studio (Dual Workspaces)
4. `layout-floating` — Floating Island Navigation

---

## 5. Quote Vault — 5 UX Reading Modes

Configured in `src/components/quotes/QuotesVault.tsx`:
1. **Zen Reader Deck** (`deck`): Full-width focus carousel with keyboard/arrow navigation (1 quote at a time).
2. **Literary Manuscript Stack** (`stack`): Annotated luxury book layout with quotes styled as serif prose and notes as marginalia.
3. **Theme Shelves & Mood Buckets** (`shelves`): Horizontal scrolling shelves grouping quotes by mood/tags.
4. **Minimalist Focus Grid** (`grid`): Clean 2/3 column responsive cards.
5. **Wisdom Infinite Stream** (`stream`): Continuous vertical feed with date stamps and expandable notes.

---

## 6. How to Run & Verify

```bash
# Start Frontend Development Server
cmd.exe /c npm run dev
# URL: http://localhost:5173/

# Run Frontend Typecheck & Production Build
cmd.exe /c npm run build

# Run 52 Playwright E2E Tests
cmd.exe /c npx playwright test tests/e2e/deep-50-suite.spec.ts --project=desktop-chrome

# Run 37 Backend API & MCP Unit Tests
cmd.exe /c npx tsx server/tests/api-mcp-tests.ts
```
