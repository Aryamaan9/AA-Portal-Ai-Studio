import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { whatsappRouter } from './whatsapp/webhook.js';
import { db } from './db.js';
import { MCP_TOOL_DEFINITIONS, executeMcpTool } from './mcp/tools.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Aryamaan Sanctuary API & MCP Server',
    time: new Date().toISOString()
  });
});

// Mount WhatsApp Ingestion Webhook
app.use('/api/whatsapp', whatsappRouter);

// REST API Endpoints (Sync with Dashboard & Clients)
app.get('/api/entries', async (req: Request, res: Response) => {
  try {
    const type = req.query.type as any;
    const query = req.query.query as string;
    const tag = req.query.tag as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    const entries = await db.searchEntries({ type, query, tag, limit });
    res.json({ success: true, count: entries.length, entries });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/entries', async (req: Request, res: Response) => {
  try {
    const entry = await db.createEntry({
      type: req.body.type || 'diary',
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      source: req.body.source || 'api',
      tags: req.body.tags || [],
      mood_state: req.body.mood_state,
      notes: req.body.notes,
      is_pinned: req.body.is_pinned || false
    });
    res.status(201).json({ success: true, entry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/todos', async (req: Request, res: Response) => {
  try {
    const isCompleted = req.query.is_completed === 'true' ? true : req.query.is_completed === 'false' ? false : undefined;
    const todos = await db.getTodos({ is_completed: isCompleted });
    res.json({ success: true, count: todos.length, todos });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/todos', async (req: Request, res: Response) => {
  try {
    const todo = await db.createTodo({
      title: req.body.title,
      notes: req.body.notes,
      due_date: req.body.due_date,
      priority: req.body.priority || 'medium',
      source: req.body.source || 'api'
    });
    res.status(201).json({ success: true, todo });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/todos/:id/complete', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const completed = await db.completeTodo(id);
    if (!completed) return res.status(404).json({ success: false, error: 'Todo not found' });
    res.json({ success: true, todo: completed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/goals', async (req: Request, res: Response) => {
  try {
    const horizon = req.query.horizon as any;
    const goals = await db.getGoals(horizon);
    res.json({ success: true, count: goals.length, goals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/today', async (req: Request, res: Response) => {
  try {
    const tz = typeof req.query.timezone === 'string' ? req.query.timezone : undefined;
    const summary = await db.getToday(tz);
    res.json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// MCP JSON-RPC / HTTP Execution Endpoint for ChatGPT Actions & Webhooks
app.get('/api/mcp/tools', (req: Request, res: Response) => {
  res.json({ success: true, tools: MCP_TOOL_DEFINITIONS });
});

app.post('/api/mcp/call', async (req: Request, res: Response) => {
  try {
    const { name, arguments: args } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Missing tool name' });

    const result = await executeMcpTool(name, args || {});
    res.json({ success: true, tool: name, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`[Sanctuary Server] HTTP API & WhatsApp Webhook running on http://localhost:${PORT}`);
  console.log(`[Sanctuary Server] WhatsApp Webhook URL: http://localhost:${PORT}/api/whatsapp/webhook`);
  console.log(`[Sanctuary Server] MCP Tools endpoint: http://localhost:${PORT}/api/mcp/tools`);
});
