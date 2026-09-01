# ChatGPT & Claude MCP Integration Guide (Connecting to App)

Connect ChatGPT, Claude Desktop, Cursor, or any Model Context Protocol (MCP) AI directly to your **Sanctuary App Server**.

---

## 🔒 The Architecture

```
ChatGPT / LLM  ──────►  Sanctuary App API / MCP  ──────►  Supabase Database
(Your AI Client)          (Validation & Etiquette)         (Secure Storage)
```

By connecting ChatGPT to your **App Server** rather than raw Supabase tables:
1. **Safety**: ChatGPT cannot delete or corrupt tables. It only has access to 7 safe, high-level tools.
2. **Formatting**: The App formats all tags, authors, and timestamps consistently.
3. **Etiquette**: The App enforces that casual conversation banter is never saved automatically.

---

## 🛠️ The 7 Tools Exposed by the App

| Tool Name | What it does | Example Prompt |
| :--- | :--- | :--- |
| `search_entries` | Search diary, reflections, quotes, moods, ideas | *"Find my quotes by Marcus Aurelius"* |
| `create_entry` | Save a diary, reflection, quote, idea, or mood | *"Save this reflection on focus"* |
| `update_entry` | Edit an existing entry by ID | *"Update the note on my last quote"* |
| `create_todo` | Add a mindful task with priority/due date | *"Add a todo: Call accountant tomorrow"* |
| `complete_todo` | Mark a task as completed | *"Mark task 123 as complete"* |
| `get_today` | Retrieve today's diary, tasks, anchor quote | *"What is on my plate today?"* |
| `get_goals` | Retrieve current season horizons and targets | *"Show my current season goals"* |

---

## 🔌 Connection Setup

### Option 1: Claude Desktop / Cursor / Local AI (MCP Stdio)
Add this to your configuration file (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "aryamaan-sanctuary": {
      "command": "node",
      "args": ["c:/Users/AA/Documents/antigravity/delightful-noether/server/dist/mcp/server.js"]
    }
  }
}
```

### Option 2: ChatGPT Custom GPT / Custom Action (HTTP API)
In the ChatGPT GPT Builder &rarr; Actions:
1. Set the Action URL to your running app server:
   ```
   POST http://localhost:3001/api/mcp/call
   ```
2. Paste the tool definitions schema from:
   ```
   GET http://localhost:3001/api/mcp/tools
   ```
3. Copy the system prompt from `server/INSTRUCTIONS_FOR_CHATGPT.md` into the Custom GPT instructions.
