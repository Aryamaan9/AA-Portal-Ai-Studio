export type EntryType = 'diary' | 'reflection' | 'quote' | 'idea' | 'mood';
export type SourceType = 'dashboard' | 'whatsapp' | 'chatgpt' | 'api';
export type PriorityType = 'low' | 'medium' | 'high';
export type GoalHorizon = 'current_season' | 'someday' | 'north_star';
export type GoalStatus = 'active' | 'paused' | 'achieved';

export interface Entry {
  id: string;
  type: EntryType;
  title?: string;
  content: string;
  author?: string;
  source: SourceType;
  tags: string[];
  mood_state?: string;
  notes?: string;
  is_pinned?: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  title: string;
  notes?: string;
  due_date?: string;
  priority: PriorityType;
  is_completed: boolean;
  source: SourceType;
  metadata?: Record<string, any>;
  created_at: string;
  completed_at?: string;
}

export interface Goal {
  id: string;
  title: string;
  horizon: GoalHorizon;
  description?: string;
  target_date?: string;
  status: GoalStatus;
  milestones?: Array<{ title: string; completed: boolean }>;
  source: SourceType;
  created_at: string;
  updated_at: string;
}

export interface DatabaseState {
  entries: Entry[];
  todos: Todo[];
  goals: Goal[];
}
