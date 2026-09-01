import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Entry, Todo, Goal, DatabaseState, EntryType, GoalHorizon } from './types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const LOCAL_DB_PATH = path.join(DATA_DIR, 'sanctuary_db.json');

// Initialize local DB directory & file
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(LOCAL_DB_PATH)) {
  const initialData: DatabaseState = {
    entries: [],
    todos: [],
    goals: []
  };
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
}

// Supabase client instance
let supabase: SupabaseClient | null = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[DB] Connected to Supabase Cloud Database:', supabaseUrl);
  } catch (err) {
    console.warn('[DB] Could not connect to Supabase, using local store:', err);
  }
} else {
  console.log('[DB] Running in Local Storage Mode (data/sanctuary_db.json)');
}

// Local storage read/write
function readLocalDb(): DatabaseState {
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { entries: [], todos: [], goals: [] };
  }
}

function writeLocalDb(data: DatabaseState): void {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[DB] Failed to write local DB:', e);
  }
}

export const db = {
  // ---------------------------------------------------------------------------
  // ENTRIES
  // ---------------------------------------------------------------------------
  async searchEntries(params: {
    query?: string;
    type?: EntryType | 'all';
    tag?: string;
    limit?: number;
  }): Promise<Entry[]> {
    const limit = params.limit || 10;

    if (supabase) {
      try {
        let q = supabase
          .from('entries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (params.type && params.type !== 'all') {
          q = q.eq('type', params.type);
        }
        if (params.tag) {
          q = q.contains('tags', [params.tag]);
        }
        if (params.query) {
          q = q.or(`content.ilike.%${params.query}%,title.ilike.%${params.query}%,author.ilike.%${params.query}%`);
        }

        const { data, error } = await q;
        if (!error && data) return data as Entry[];
      } catch (err) {
        console.warn('[DB] Supabase search error, falling back to local:', err);
      }
    }

    // Local fallback search
    const local = readLocalDb();
    let results = [...local.entries];

    if (params.type && params.type !== 'all') {
      results = results.filter((e) => e.type === params.type);
    }
    if (params.tag) {
      results = results.filter((e) => e.tags && e.tags.includes(params.tag!));
    }
    if (params.query && params.query.trim()) {
      const qLower = params.query.toLowerCase();
      results = results.filter(
        (e) =>
          (e.content && e.content.toLowerCase().includes(qLower)) ||
          (e.title && e.title.toLowerCase().includes(qLower)) ||
          (e.author && e.author.toLowerCase().includes(qLower)) ||
          (e.notes && e.notes.toLowerCase().includes(qLower))
      );
    }

    return results.slice(0, limit);
  },

  async createEntry(data: Omit<Entry, 'id' | 'created_at' | 'updated_at'>): Promise<Entry> {
    const now = new Date().toISOString();
    const newEntry: Entry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...data,
      created_at: now,
      updated_at: now
    };

    if (supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('entries')
          .insert({
            type: newEntry.type,
            title: newEntry.title,
            content: newEntry.content,
            author: newEntry.author,
            source: newEntry.source,
            tags: newEntry.tags || [],
            mood_state: newEntry.mood_state,
            notes: newEntry.notes,
            is_pinned: newEntry.is_pinned || false,
            metadata: newEntry.metadata || {}
          })
          .select()
          .single();

        if (!error && inserted) {
          return inserted as Entry;
        }
      } catch (err) {
        console.warn('[DB] Supabase insert error, saving locally:', err);
      }
    }

    // Local fallback
    const local = readLocalDb();
    local.entries.unshift(newEntry);
    writeLocalDb(local);
    return newEntry;
  },

  async updateEntry(id: string, updates: Partial<Entry>): Promise<Entry | null> {
    const now = new Date().toISOString();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('entries')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) return data as Entry;
      } catch (err) {
        console.warn('[DB] Supabase update error, trying local:', err);
      }
    }

    const local = readLocalDb();
    const index = local.entries.findIndex((e) => e.id === id);
    if (index === -1) return null;

    local.entries[index] = {
      ...local.entries[index],
      ...updates,
      updated_at: now
    };
    writeLocalDb(local);
    return local.entries[index];
  },

  // ---------------------------------------------------------------------------
  // TODOS
  // ---------------------------------------------------------------------------
  async getTodos(filter?: { is_completed?: boolean }): Promise<Todo[]> {
    if (supabase) {
      try {
        let q = supabase.from('todos').select('*').order('created_at', { ascending: false });
        if (filter?.is_completed !== undefined) {
          q = q.eq('is_completed', filter.is_completed);
        }
        const { data, error } = await q;
        if (!error && data) return data as Todo[];
      } catch (err) {
        console.warn('[DB] Supabase getTodos error:', err);
      }
    }

    const local = readLocalDb();
    let results = local.todos;
    if (filter?.is_completed !== undefined) {
      results = results.filter((t) => t.is_completed === filter.is_completed);
    }
    return results;
  },

  async createTodo(data: Omit<Todo, 'id' | 'created_at' | 'is_completed'>): Promise<Todo> {
    const now = new Date().toISOString();
    const newTodo: Todo = {
      id: 'todo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...data,
      is_completed: false,
      created_at: now
    };

    if (supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('todos')
          .insert({
            title: newTodo.title,
            notes: newTodo.notes,
            due_date: newTodo.due_date,
            priority: newTodo.priority,
            is_completed: false,
            source: newTodo.source,
            metadata: newTodo.metadata || {}
          })
          .select()
          .single();

        if (!error && inserted) return inserted as Todo;
      } catch (err) {
        console.warn('[DB] Supabase insert todo error:', err);
      }
    }

    const local = readLocalDb();
    local.todos.unshift(newTodo);
    writeLocalDb(local);
    return newTodo;
  },

  async completeTodo(id: string): Promise<Todo | null> {
    const now = new Date().toISOString();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('todos')
          .update({ is_completed: true, completed_at: now })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) return data as Todo;
      } catch (err) {
        console.warn('[DB] Supabase completeTodo error:', err);
      }
    }

    const local = readLocalDb();
    const index = local.todos.findIndex((t) => t.id === id);
    if (index === -1) return null;

    local.todos[index] = {
      ...local.todos[index],
      is_completed: true,
      completed_at: now
    };
    writeLocalDb(local);
    return local.todos[index];
  },

  // ---------------------------------------------------------------------------
  // GOALS
  // ---------------------------------------------------------------------------
  async getGoals(horizon?: GoalHorizon | 'all'): Promise<Goal[]> {
    if (supabase) {
      try {
        let q = supabase.from('goals').select('*').order('created_at', { ascending: false });
        if (horizon && horizon !== 'all') {
          q = q.eq('horizon', horizon);
        }
        const { data, error } = await q;
        if (!error && data) return data as Goal[];
      } catch (err) {
        console.warn('[DB] Supabase getGoals error:', err);
      }
    }

    const local = readLocalDb();
    let results = local.goals;
    if (horizon && horizon !== 'all') {
      results = results.filter((g) => g.horizon === horizon);
    }
    return results;
  },

  async createGoal(data: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    const now = new Date().toISOString();
    const newGoal: Goal = {
      id: 'goal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...data,
      created_at: now,
      updated_at: now
    };

    if (supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('goals')
          .insert({
            title: newGoal.title,
            horizon: newGoal.horizon,
            description: newGoal.description,
            target_date: newGoal.target_date,
            status: newGoal.status,
            milestones: newGoal.milestones || [],
            source: newGoal.source
          })
          .select()
          .single();

        if (!error && inserted) return inserted as Goal;
      } catch (err) {
        console.warn('[DB] Supabase insert goal error:', err);
      }
    }

    const local = readLocalDb();
    local.goals.unshift(newGoal);
    writeLocalDb(local);
    return newGoal;
  },

  // ---------------------------------------------------------------------------
  // GET TODAY
  // ---------------------------------------------------------------------------
  async getToday(timezone?: string): Promise<{
    date: string;
    diaryEntries: Entry[];
    reflections: Entry[];
    activeTodos: Todo[];
    completedTodosToday: Todo[];
    dailyAnchorQuote: Entry | null;
  }> {
    const now = new Date();
    const todayPrefix = now.toISOString().slice(0, 10); // YYYY-MM-DD

    const entries = await this.searchEntries({ limit: 100 });
    const todos = await this.getTodos();

    const diaryEntries = entries.filter(
      (e) => e.type === 'diary' && e.created_at.startsWith(todayPrefix)
    );
    const reflections = entries.filter(
      (e) => (e.type === 'reflection' || e.type === 'mood') && e.created_at.startsWith(todayPrefix)
    );

    const activeTodos = todos.filter((t) => !t.is_completed);
    const completedTodosToday = todos.filter(
      (t) => t.is_completed && t.completed_at && t.completed_at.startsWith(todayPrefix)
    );

    const quotes = entries.filter((e) => e.type === 'quote');
    const pinnedQuote = quotes.find((q) => q.is_pinned);
    const dailyAnchorQuote = pinnedQuote || (quotes.length > 0 ? quotes[0] : null);

    return {
      date: todayPrefix,
      diaryEntries,
      reflections,
      activeTodos,
      completedTodosToday,
      dailyAnchorQuote
    };
  }
};
