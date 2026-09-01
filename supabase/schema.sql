-- ==============================================================================
-- Aryamaan Dashboard & Sanctuary — Supabase Life Database Schema
-- Unified schema for Dashboard (Web/Mobile), WhatsApp Capture, and ChatGPT MCP
-- ==============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENTRIES TABLE (Diary, Reflections, Quotes, Ideas, Moods)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('diary', 'reflection', 'quote', 'idea', 'mood')),
    title TEXT,
    content TEXT NOT NULL,
    author TEXT,                       -- Used for quotes
    source VARCHAR(50) DEFAULT 'dashboard' CHECK (source IN ('dashboard', 'whatsapp', 'chatgpt', 'api')),
    tags TEXT[] DEFAULT '{}',
    mood_state VARCHAR(100),            -- e.g. "7/10", "Calm", "Anxious", "Grounded"
    notes TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb, -- Raw context or AI parsing metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. TODOS TABLE (Tasks & Mindful Action Items)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    notes TEXT,
    due_date TIMESTAMPTZ,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_completed BOOLEAN DEFAULT FALSE,
    source VARCHAR(50) DEFAULT 'dashboard' CHECK (source IN ('dashboard', 'whatsapp', 'chatgpt', 'api')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 3. GOALS TABLE (Horizons, Intentions, Vision)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    horizon VARCHAR(50) DEFAULT 'current_season' CHECK (horizon IN ('current_season', 'someday', 'north_star')),
    description TEXT,
    target_date TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'achieved')),
    milestones JSONB DEFAULT '[]'::jsonb,
    source VARCHAR(50) DEFAULT 'dashboard' CHECK (source IN ('dashboard', 'whatsapp', 'chatgpt', 'api')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR INSTANT QUERIES & SEMANTIC SEARCH
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_entries_type ON public.entries (type);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON public.entries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entries_is_pinned ON public.entries (is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_entries_tags ON public.entries USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_todos_is_completed ON public.todos (is_completed);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_goals_horizon ON public.goals (horizon);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals (status);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users / service role full access
CREATE POLICY "Allow authenticated read/write on entries" ON public.entries
    FOR ALL USING (auth.role() IN ('authenticated', 'service_role', 'anon'))
    WITH CHECK (auth.role() IN ('authenticated', 'service_role', 'anon'));

CREATE POLICY "Allow authenticated read/write on todos" ON public.todos
    FOR ALL USING (auth.role() IN ('authenticated', 'service_role', 'anon'))
    WITH CHECK (auth.role() IN ('authenticated', 'service_role', 'anon'));

CREATE POLICY "Allow authenticated read/write on goals" ON public.goals
    FOR ALL USING (auth.role() IN ('authenticated', 'service_role', 'anon'))
    WITH CHECK (auth.role() IN ('authenticated', 'service_role', 'anon'));
