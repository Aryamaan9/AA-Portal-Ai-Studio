import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit as fsLimit, 
  doc, 
  updateDoc, 
  getDoc 
} from "firebase/firestore";
import dotenv from 'dotenv';
import { Entry, Todo, Goal, DatabaseState, EntryType, GoalHorizon } from './types.js';

dotenv.config();

// Standard Firebase config from your frontend environment
const firebaseConfig = {
  projectId: "aa-portal-sanctuary",
  appId: "1:359114308016:web:6cc7703a608f1ac28cfe75",
  storageBucket: "aa-portal-sanctuary.firebasestorage.app",
  apiKey: "AIzaSyA9fcptAbbXGGX2wiCHe3oQWTRXPAZDo1s",
  authDomain: "aa-portal-sanctuary.firebaseapp.com",
  messagingSenderId: "359114308016"
};

const app = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(app);

console.log('[DB] Server connected directly to Firebase Firestore');

// Mappers to convert between Server `Entry` and Frontend schemas
function mapQuoteToEntry(q: any, id: string): Entry {
  return {
    id,
    type: 'quote',
    content: q.text || '',
    author: q.author || '',
    source: q.source || 'web',
    tags: q.tags || [],
    notes: q.notes || '',
    is_pinned: q.isPinned || false,
    created_at: q.createdAt || new Date().toISOString(),
    updated_at: q.updatedAt || new Date().toISOString()
  };
}

function mapDiaryToEntry(d: any, id: string): Entry {
  return {
    id,
    type: 'diary',
    title: d.title || '',
    content: d.rawContent || '',
    source: d.source || 'web',
    tags: d.tags || [],
    notes: d.refinedContent || '',
    created_at: d.createdAt || new Date().toISOString(),
    updated_at: d.updatedAt || new Date().toISOString()
  };
}

export const db = {
  async searchEntries(params: { query?: string; type?: EntryType | 'all'; tag?: string; limit?: number; }): Promise<Entry[]> {
    const results: Entry[] = [];
    try {
      // Fetch quotes if applicable
      if (!params.type || params.type === 'all' || params.type === 'quote') {
        const qs = await getDocs(query(collection(firestoreDb, 'quotes'), orderBy('createdAt', 'desc'), fsLimit(50)));
        qs.forEach(d => results.push(mapQuoteToEntry(d.data(), d.id)));
      }
      
      // Fetch diary if applicable
      if (!params.type || params.type === 'all' || params.type === 'diary' || params.type === 'reflection' || params.type === 'mood') {
        const ds = await getDocs(query(collection(firestoreDb, 'diary'), orderBy('createdAt', 'desc'), fsLimit(50)));
        ds.forEach(d => results.push(mapDiaryToEntry(d.data(), d.id)));
      }
      
      // Filter results in memory
      let filtered = results;
      if (params.tag) {
        filtered = filtered.filter(e => e.tags && e.tags.includes(params.tag!));
      }
      if (params.query) {
        const qLower = params.query.toLowerCase();
        filtered = filtered.filter(e => 
          (e.content && e.content.toLowerCase().includes(qLower)) ||
          (e.title && e.title.toLowerCase().includes(qLower)) ||
          (e.author && e.author.toLowerCase().includes(qLower))
        );
      }
      
      // Sort by date desc
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return filtered.slice(0, params.limit || 10);
    } catch (err) {
      console.error('[DB] Error searching entries in Firebase:', err);
      return [];
    }
  },

  async createEntry(data: Omit<Entry, 'id' | 'created_at' | 'updated_at'>): Promise<Entry> {
    const now = new Date().toISOString();
    
    try {
      if (data.type === 'quote') {
        const quoteData = {
          text: data.content || '',
          author: data.author || 'Unknown',
          source: data.source || 'web',
          tags: data.tags || [],
          notes: data.notes || '',
          isPinned: data.is_pinned || false,
          createdAt: now,
          updatedAt: now
        };
        const docRef = await addDoc(collection(firestoreDb, 'quotes'), quoteData);
        return mapQuoteToEntry(quoteData, docRef.id);
      } else {
        // Diary / Reflection / Mood
        const diaryData = {
          title: data.title || '',
          date: now.slice(0, 10),
          rawContent: data.content || '',
          refinedContent: data.notes || '',
          learnings: [],
          tags: data.tags || [],
          source: data.source || 'web',
          createdAt: now,
          updatedAt: now
        };
        const docRef = await addDoc(collection(firestoreDb, 'diary'), diaryData);
        return mapDiaryToEntry(diaryData, docRef.id);
      }
    } catch (err) {
      console.error('[DB] Error creating entry in Firebase:', err);
      throw err;
    }
  },

  async updateEntry(id: string, updates: Partial<Entry>): Promise<Entry | null> {
    try {
      const qRef = doc(firestoreDb, 'quotes', id);
      const qSnap = await getDoc(qRef);
      if (qSnap.exists()) {
         await updateDoc(qRef, {
           text: updates.content !== undefined ? updates.content : qSnap.data().text,
           updatedAt: new Date().toISOString()
         });
         return mapQuoteToEntry((await getDoc(qRef)).data(), id);
      }
      
      const dRef = doc(firestoreDb, 'diary', id);
      const dSnap = await getDoc(dRef);
      if (dSnap.exists()) {
         await updateDoc(dRef, {
           rawContent: updates.content !== undefined ? updates.content : dSnap.data().rawContent,
           updatedAt: new Date().toISOString()
         });
         return mapDiaryToEntry((await getDoc(dRef)).data(), id);
      }
    } catch (e) {
      console.error('[DB] Error updating', e);
    }
    return null;
  },

  async getTodos(filter?: { is_completed?: boolean }): Promise<Todo[]> {
    try {
       const qs = await getDocs(query(collection(firestoreDb, 'todos'), orderBy('created_at', 'desc')));
       let todos = qs.docs.map(d => ({ id: d.id, ...d.data() } as Todo));
       if (filter && filter.is_completed !== undefined) {
         todos = todos.filter(t => t.is_completed === filter.is_completed);
       }
       return todos;
    } catch(e) { return []; }
  },

  async createTodo(data: Omit<Todo, 'id' | 'created_at' | 'is_completed'>): Promise<Todo> {
    const now = new Date().toISOString();
    const todoData = {
      ...data,
      is_completed: false,
      created_at: now
    };
    try {
      const ref = await addDoc(collection(firestoreDb, 'todos'), todoData);
      return { id: ref.id, ...todoData } as Todo;
    } catch(err) {
      console.error('[DB] Error creating todo:', err);
      throw err;
    }
  },

  async completeTodo(id: string): Promise<Todo | null> {
    try {
      const ref = doc(firestoreDb, 'todos', id);
      await updateDoc(ref, { is_completed: true, completed_at: new Date().toISOString() });
      const snap = await getDoc(ref);
      return { id: snap.id, ...snap.data() } as Todo;
    } catch(e) { return null; }
  },

  async getGoals(horizon?: GoalHorizon | 'all'): Promise<Goal[]> {
    try {
       const qs = await getDocs(query(collection(firestoreDb, 'goals'), orderBy('created_at', 'desc')));
       let goals = qs.docs.map(d => ({ id: d.id, ...d.data() } as Goal));
       if (horizon && horizon !== 'all') {
         goals = goals.filter(g => g.horizon === horizon);
       }
       return goals;
    } catch(e) { return []; }
  },

  async createGoal(data: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    const now = new Date().toISOString();
    const goalData = { ...data, created_at: now, updated_at: now };
    try {
      const ref = await addDoc(collection(firestoreDb, 'goals'), goalData);
      return { id: ref.id, ...goalData } as Goal;
    } catch (err) {
      console.error('[DB] Error creating goal:', err);
      throw err;
    }
  },

  async getToday(timezone?: string): Promise<any> {
    const now = new Date();
    const todayPrefix = now.toISOString().slice(0, 10);
    
    const entries = await this.searchEntries({ limit: 100 });
    const todos = await this.getTodos();
    
    return {
      date: todayPrefix,
      diaryEntries: entries.filter(e => e.type === 'diary' && e.created_at.startsWith(todayPrefix)),
      reflections: entries.filter(e => (e.type === 'reflection' || e.type === 'mood') && e.created_at.startsWith(todayPrefix)),
      activeTodos: todos.filter(t => !t.is_completed),
      completedTodosToday: todos.filter(t => t.is_completed && t.completed_at?.startsWith(todayPrefix)),
      dailyAnchorQuote: entries.find(e => e.type === 'quote' && e.is_pinned) || entries.find(e => e.type === 'quote') || null
    };
  }
};
