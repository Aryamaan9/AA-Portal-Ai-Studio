import { db } from '../src/db.js';
import { classifyWhatsAppMessage } from '../src/whatsapp/classifier.js';
import { executeMcpTool, MCP_TOOL_DEFINITIONS } from '../src/mcp/tools.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` (${detail})` : ''}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING EXTENSIVE SANCTUARY BACKEND & MCP TESTS');
  console.log('======================================================\n');

  // ---------------------------------------------------------------------------
  // 1. WhatsApp Natural Language AI Classifier Tests
  // ---------------------------------------------------------------------------
  console.log('--- 1. WhatsApp Natural Language Classification Tests ---');

  // Test Case 1: Diary
  const diaryMsg = 'Today was actually a really good day.';
  const c1 = await classifyWhatsAppMessage(diaryMsg);
  assert(c1.primaryType === 'diary', 'Classifies diary entry', `Got ${c1.primaryType}`);
  assert(c1.source === 'whatsapp', 'Sets source to whatsapp');

  // Test Case 2: Quote
  const quoteMsg = 'Quote: The obstacle is the way. — Marcus Aurelius';
  const c2 = await classifyWhatsAppMessage(quoteMsg);
  assert(c2.primaryType === 'quote', 'Classifies quote', `Got ${c2.primaryType}`);
  assert(c2.cleanContent.includes('obstacle is the way'), 'Cleans quote text');
  assert(c2.author === 'Marcus Aurelius', 'Extracts author');

  // Test Case 3: Idea
  const ideaMsg = "I've been thinking that maybe I should explore studying abroad.";
  const c3 = await classifyWhatsAppMessage(ideaMsg);
  assert(c3.primaryType === 'idea', 'Classifies life idea', `Got ${c3.primaryType}`);

  // Test Case 4: Todo with relative due date
  const todoMsg = 'Todo: Call CA tomorrow.';
  const c4 = await classifyWhatsAppMessage(todoMsg);
  assert(c4.primaryType === 'todo', 'Classifies todo', `Got ${c4.primaryType}`);
  assert(c4.title.toLowerCase().includes('call ca'), 'Extracts todo title');
  assert(c4.todoDueDate !== undefined, 'Infers due date for tomorrow');

  // Test Case 5: Mood score rating
  const moodMsg = 'Feeling 7/10 today. Much better than yesterday.';
  const c5 = await classifyWhatsAppMessage(moodMsg);
  assert(c5.primaryType === 'mood', 'Classifies mood check-in', `Got ${c5.primaryType}`);
  assert(c5.moodState === '7/10', 'Extracts mood state 7/10');

  // ---------------------------------------------------------------------------
  // 2. MCP Tools Schema & Definition Tests
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. MCP Tools Definition Tests ---');
  const expectedTools = [
    'search_entries',
    'create_entry',
    'update_entry',
    'create_todo',
    'complete_todo',
    'get_today',
    'get_goals'
  ];

  assert(MCP_TOOL_DEFINITIONS.length === 7, 'Exposes strictly 7 MCP tools');
  for (const toolName of expectedTools) {
    const found = MCP_TOOL_DEFINITIONS.find((t) => t.name === toolName);
    assert(found !== undefined, `MCP tool exists: ${toolName}`);
  }

  // ---------------------------------------------------------------------------
  // 3. MCP Tool Execution & Database End-to-End Tests
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. MCP Tool Execution Tests ---');

  // 3.1 create_entry (Quote)
  const createdQuote = await executeMcpTool('create_entry', {
    type: 'quote',
    content: 'You have power over your mind - not outside events.',
    author: 'Marcus Aurelius',
    source: 'Meditations',
    tags: ['Stoicism', 'Peace', 'Clarity']
  });
  assert(createdQuote.success === true, 'create_entry (quote) succeeds');
  assert(createdQuote.entry.id !== undefined, 'Generated entry ID');
  assert(createdQuote.entry.source === 'chatgpt', 'Source set to chatgpt');

  // 3.2 create_entry (Diary)
  const createdDiary = await executeMcpTool('create_entry', {
    type: 'diary',
    content: 'A quiet evening walking in the rain. Felt clear and grounded.',
    tags: ['Presence', 'Walk']
  });
  assert(createdDiary.success === true, 'create_entry (diary) succeeds');

  // 3.3 search_entries
  const searchResults = await executeMcpTool('search_entries', {
    query: 'outside events'
  });
  assert(searchResults.count >= 1, 'search_entries finds quote by keyword');
  assert(searchResults.entries[0].author === 'Marcus Aurelius', 'Search result matches author');

  // 3.4 update_entry
  const updated = await executeMcpTool('update_entry', {
    id: createdQuote.entry.id,
    notes: 'Remember this during stressful meetings'
  });
  assert(updated.success === true, 'update_entry updates note');
  assert(updated.entry.notes === 'Remember this during stressful meetings', 'Updated note matches');

  // 3.5 create_todo
  const todoResult = await executeMcpTool('create_todo', {
    title: 'Review quarterly architecture roadmap',
    priority: 'high'
  });
  assert(todoResult.success === true, 'create_todo succeeds');
  assert(todoResult.todo.is_completed === false, 'New todo is active');

  // 3.6 complete_todo
  const completedResult = await executeMcpTool('complete_todo', {
    id: todoResult.todo.id
  });
  assert(completedResult.success === true, 'complete_todo succeeds');
  assert(completedResult.todo.is_completed === true, 'Todo is marked complete');

  // 3.7 get_goals & createGoal
  await db.createGoal({
    title: 'Achieve deep somatic calm & steady focus',
    horizon: 'current_season',
    description: 'Daily meditation and zero rushing',
    status: 'active',
    source: 'dashboard'
  });

  const goalsResult = await executeMcpTool('get_goals', { horizon: 'current_season' });
  assert(goalsResult.count >= 1, 'get_goals returns active horizons');

  // 3.8 get_today
  const todaySummary = await executeMcpTool('get_today', {});
  assert(todaySummary.date !== undefined, 'get_today returns current date');
  assert(Array.isArray(todaySummary.diaryEntries), 'get_today returns diaryEntries array');
  assert(Array.isArray(todaySummary.activeTodos), 'get_today returns activeTodos array');

  // ---------------------------------------------------------------------------
  // 4. Data Stability & Concurrency Stress Tests
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Data Stability & Stress Tests ---');

  // Concurrent write test
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(
      db.createEntry({
        type: 'idea',
        content: `Concurrent test idea #${i}`,
        source: 'api',
        tags: ['StressTest']
      })
    );
  }
  const writeResults = await Promise.all(promises);
  assert(writeResults.length === 10, 'Handled 10 concurrent writes without corruption');

  const stressSearch = await db.searchEntries({ tag: 'StressTest' });
  assert(stressSearch.length === 10, 'All 10 concurrent entries persisted safely');

  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  console.log('======================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL BACKEND & MCP INTEGRATION TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
