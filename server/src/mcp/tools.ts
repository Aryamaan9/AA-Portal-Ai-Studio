import { db } from '../db.js';
import { EntryType, PriorityType, GoalHorizon } from '../types.js';

export const MCP_TOOL_DEFINITIONS = [
  {
    name: 'search_entries',
    description: 'Search diary, reflections, moods, quotes, ideas, goals, and saved life information in Aryamaan Sanctuary.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search keywords or phrases'
        },
        type: {
          type: 'string',
          enum: ['diary', 'reflection', 'quote', 'idea', 'mood', 'all'],
          description: 'Filter by entry type (optional, default: all)'
        },
        tag: {
          type: 'string',
          description: 'Filter by tag (optional)'
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (default: 10)'
        }
      }
    }
  },
  {
    name: 'create_entry',
    description: 'Create a new diary, reflection, quote, idea, or mood entry in Aryamaan Sanctuary. NOTE: Only save when user explicitly asks or when a clearly meaningful reflection/quote/idea belongs in the dashboard.',
    inputSchema: {
      type: 'object',
      required: ['type', 'content'],
      properties: {
        type: {
          type: 'string',
          enum: ['diary', 'reflection', 'quote', 'idea', 'mood'],
          description: 'Category of the entry'
        },
        content: {
          type: 'string',
          description: 'The core text, quote, or reflection note'
        },
        title: {
          type: 'string',
          description: 'Optional short title'
        },
        author: {
          type: 'string',
          description: 'Author of the quote (for quote type)'
        },
        source: {
          type: 'string',
          description: 'Origin or context (book, podcast, date)'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of tags (e.g. Peace, Resilience, Career)'
        },
        mood_state: {
          type: 'string',
          description: 'Mood rating or descriptor (e.g. "7/10", "Calm")'
        },
        notes: {
          type: 'string',
          description: 'Personal notes or why this matters'
        }
      }
    }
  },
  {
    name: 'update_entry',
    description: 'Edit or refine an existing diary, reflection, quote, or idea in Aryamaan Sanctuary.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the entry to update'
        },
        content: {
          type: 'string',
          description: 'Updated content'
        },
        title: {
          type: 'string',
          description: 'Updated title'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Updated tags list'
        },
        mood_state: {
          type: 'string',
          description: 'Updated mood state'
        },
        notes: {
          type: 'string',
          description: 'Updated personal note'
        }
      }
    }
  },
  {
    name: 'create_todo',
    description: 'Add a new mindful action item or task to Aryamaan Sanctuary.',
    inputSchema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: {
          type: 'string',
          description: 'Task description'
        },
        notes: {
          type: 'string',
          description: 'Additional context or steps'
        },
        due_date: {
          type: 'string',
          description: 'Due date in ISO format or relative date'
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Priority level (default: medium)'
        }
      }
    }
  },
  {
    name: 'complete_todo',
    description: 'Mark a task as completed in Aryamaan Sanctuary.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the todo to mark complete'
        }
      }
    }
  },
  {
    name: 'get_today',
    description: "Retrieve today's diary entries, reflections, active tasks, completed tasks, and daily anchor quote from Aryamaan Sanctuary.",
    inputSchema: {
      type: 'object',
      properties: {
        timezone: {
          type: 'string',
          description: 'Optional timezone string, e.g. "Asia/Kolkata"'
        }
      }
    }
  },
  {
    name: 'get_goals',
    description: 'Retrieve current goals, targets, and life horizons from Aryamaan Sanctuary.',
    inputSchema: {
      type: 'object',
      properties: {
        horizon: {
          type: 'string',
          enum: ['current_season', 'someday', 'north_star', 'all'],
          description: 'Filter by horizon (optional, default: all)'
        }
      }
    }
  }
];

export async function executeMcpTool(name: string, args: any): Promise<any> {
  switch (name) {
    case 'search_entries': {
      const results = await db.searchEntries({
        query: args.query,
        type: args.type,
        tag: args.tag,
        limit: args.limit
      });
      return {
        count: results.length,
        entries: results
      };
    }

    case 'create_entry': {
      const entry = await db.createEntry({
        type: args.type as EntryType,
        title: args.title,
        content: args.content,
        author: args.author,
        source: 'chatgpt',
        tags: args.tags || [],
        mood_state: args.mood_state,
        notes: args.notes,
        is_pinned: false
      });
      return {
        success: true,
        message: `Saved ${args.type} to Aryamaan Sanctuary`,
        entry
      };
    }

    case 'update_entry': {
      const updated = await db.updateEntry(args.id, {
        content: args.content,
        title: args.title,
        tags: args.tags,
        mood_state: args.mood_state,
        notes: args.notes
      });
      if (!updated) {
        throw new Error(`Entry with ID ${args.id} not found`);
      }
      return {
        success: true,
        message: 'Entry updated successfully',
        entry: updated
      };
    }

    case 'create_todo': {
      const todo = await db.createTodo({
        title: args.title,
        notes: args.notes,
        due_date: args.due_date,
        priority: (args.priority || 'medium') as PriorityType,
        source: 'chatgpt'
      });
      return {
        success: true,
        message: 'Task added to Sanctuary',
        todo
      };
    }

    case 'complete_todo': {
      const completed = await db.completeTodo(args.id);
      if (!completed) {
        throw new Error(`Todo with ID ${args.id} not found`);
      }
      return {
        success: true,
        message: 'Task marked as completed',
        todo: completed
      };
    }

    case 'get_today': {
      const summary = await db.getToday(args.timezone);
      return summary;
    }

    case 'get_goals': {
      const goals = await db.getGoals(args.horizon as GoalHorizon | 'all');
      return {
        count: goals.length,
        goals
      };
    }

    default:
      throw new Error(`Unknown MCP tool: ${name}`);
  }
}
