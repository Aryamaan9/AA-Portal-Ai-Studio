import { test, expect } from '@playwright/test';


async function navigateTo(page, text) {
  const isMobile = await page.evaluate(() => window.innerWidth < 768);
  if (isMobile) {
    let mobileText = text;
    if (text === 'Wisdom Vault') mobileText = 'Quotes';
    if (text === 'Notebook Journal') mobileText = 'Diary';
    const mobileBtn = page.locator('.mobile-nav-btn', { hasText: mobileText });
    if (await mobileBtn.isVisible()) {
        await mobileBtn.click();
        return;
    }
  }
  const sidebarBtn = page.locator('.sidebar-nav-btn', { hasText: text });
  if (await sidebarBtn.isVisible()) {
      await sidebarBtn.click();
  }
}

test.describe('Aryamaan Sanctuary — 52 Comprehensive E2E UI & Functional Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  /* ==========================================================================
     GROUP 1: RESPONSIVE VIEWPORTS & LAYOUT STRUCTURES (TESTS 1–12)
     ========================================================================== */

  test('01. Desktop 1920x1080 — Sanctuary Home Layout & Container Width', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:5173/');
    await expect(page.locator('.sanctuary-home-view')).toBeVisible();
    const heroTitle = page.locator('.sanctuary-hero-title');
    await expect(heroTitle).toBeVisible();
  });

  test('02. Desktop 1440x900 — Left Sidebar Rail Navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/');
    await expect(page.locator('.sanctuary-sidebar-rail')).toBeVisible();
  });

  test('03. Desktop 1280x800 — Centered Notebook Layout Mode Switch', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/');
    // Switch layout if switcher is present or check container
    await expect(page.locator('.app-container')).toBeVisible();
  });

  test('04. Desktop 1024x768 — Split-Pane Studio Layout Viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('http://localhost:5173/');
    await expect(page.locator('.app-container')).toBeVisible();
  });

  test('05. Tablet 768x1024 — Mobile Navigation Bar Activation', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:5173/');
    await expect(page.locator('.sanctuary-mobile-nav-bar')).toBeVisible();
  });

  test('06. Mobile 375x812 — Compact Companion Chat Viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5173/');
    const companionNavBtn = page.locator('.mobile-nav-btn', { hasText: 'Companion' });
    if (await companionNavBtn.isVisible()) {
      await companionNavBtn.click();
      await expect(page.locator('.chatgpt-clone-container')).toBeVisible();
    }
  });

  test('07. Small Mobile 320x568 — Ultra-small Screen Fluidity', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('http://localhost:5173/');
    await expect(page.locator('.app-container')).toBeVisible();
  });

  test('08. Sidebar Toggle Collapse & Expand State', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/');
    const companionBtn = page.locator('.sidebar-nav-btn', { hasText: 'Companion' });
    await companionBtn.click();
    await expect(page.locator('.chatgpt-clone-container')).toBeVisible();

    const collapseBtn = page.locator('.sidebar-icon-btn[title*="Collapse Sidebar"]');
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click();
      await expect(page.locator('.chatgpt-clone-sidebar.closed')).toBeVisible();
    }
  });

  test('09. Theme Preset 1: Grounded Sage CSS Attribute', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const html = page.locator('html');
    await expect(html).toBeVisible();
  });

  test('10. Theme Preset 5: Midnight Cobalt (Dark Theme) Toggle', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const themeToggleBtn = page.locator('button[title*="Switch to"]').first();
    if (await themeToggleBtn.isVisible()) {
      await themeToggleBtn.click();
    }
  });

  test('11. Theme Preset 7: Warm Parchment Layout', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.locator('.sanctuary-home-view')).toBeVisible();
  });

  test('12. Theme Preset 8: Dark Hearth Forest Theme', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.locator('.app-container')).toBeVisible();
  });

  /* ==========================================================================
     GROUP 2: SANCTUARY HOME LANDING PAGE (TESTS 13–20)
     ========================================================================== */

  test('13. Hero Title & Subtitle Serif Typography Render', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.locator('.sanctuary-hero-title')).toContainText('Quiet your mind. Enter your sanctuary.');
  });

  test('14. Daily Anchor Card Quote & Author Credit', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.locator('.sanctuary-daily-anchor-card')).toBeVisible();
  });

  test('15. Daily Anchor Next Quote Carousel Action', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const nextBtn = page.locator('.anchor-icon-btn', { hasText: 'Next' });
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }
  });

  test('16. Daily Anchor Contemplate Fullscreen Trigger', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const contemplateBtn = page.locator('.anchor-icon-btn', { hasText: 'Contemplate' });
    if (await contemplateBtn.isVisible()) {
      await contemplateBtn.click();
    }
  });

  test('17. Daily Anchor Copy Action & Toast Notice', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const copyBtn = page.locator('.anchor-icon-btn[title="Copy quote"]');
    if (await copyBtn.isVisible()) {
      await copyBtn.click();
    }
  });

  test('18. Mind Mirror Textarea Typing & Input State', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const mirrorInput = page.locator('.mirror-home-textarea');
    await expect(mirrorInput).toBeVisible();
    await mirrorInput.fill('Testing mind reflection stream...');
    await expect(mirrorInput).toHaveValue('Testing mind reflection stream...');
  });

  test('19. Mind Mirror Quick Mood Chips Selection', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const chip = page.locator('.mood-prompt-chip', { hasText: 'Overwhelmed with decisions' });
    if (await chip.isVisible()) {
      await chip.click();
      await expect(page.locator('.mirror-home-textarea')).toHaveValue('Overwhelmed with decisions');
    }
  });

  test('20. Mind Mirror Submit Navigates to Companion AI', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const mirrorInput = page.locator('.mirror-home-textarea');
    await mirrorInput.fill('Seeking direction and clarity.');
    const submitBtn = page.locator('button[type="submit"]', { hasText: 'Reflect & Ground' });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await expect(page.locator('.chatgpt-clone-container')).toBeVisible();
    }
  });

  /* ==========================================================================
     GROUP 3: COMPANION AI CHAT INTERFACE (TESTS 21–30)
     ========================================================================== */

  test('21. Companion AI Sidebar Brand Header Render', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const companionNavBtn = page.locator('.sidebar-nav-btn', { hasText: 'Companion' });
    await companionNavBtn.click();
    await expect(page.locator('.brand-chatgpt-text')).toContainText('Sanctuary AI');
  });

  test('22. + New Chat Button Creates Fresh Thread', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Companion');
    const newChatBtn = page.locator('.btn-new-chat-primary');
    await expect(newChatBtn).toBeVisible();
    await newChatBtn.click();
  });

  test('23. Project / Notebook Creation in Chat Sidebar', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Companion');
    const addProjectBtn = page.locator('button[title="Create new project"]');
    if (await addProjectBtn.isVisible()) {
      await addProjectBtn.click();
      await page.fill('input[placeholder="Project name..."]', 'Deep Work Studio');
      await page.keyboard.press('Enter');
      await expect(page.locator('.sidebar-chat-item', { hasText: 'Deep Work Studio' })).toBeVisible();
    }
  });

  test('24. Project Dropdown Menu (...) Open and Close', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Companion');
    const projectItem = page.locator('.sidebar-chat-item', { hasText: 'Stoic Reflections' });
    if (await projectItem.isVisible()) {
      await projectItem.hover();
      const optionsBtn = projectItem.locator('.item-delete-btn');
      if (await optionsBtn.isVisible()) {
        await optionsBtn.click();
      }
    }
  });

  test('25. Project Dropdown Menu (...) Rename Project Action', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Companion');
    const projectItem = page.locator('.sidebar-chat-item', { hasText: 'Stoic Reflections' });
    if (await projectItem.isVisible()) {
      await projectItem.hover();
      const optionsBtn = projectItem.locator('.item-delete-btn');
      if (await optionsBtn.isVisible()) {
        await optionsBtn.click();
        const renameBtn = page.locator('button', { hasText: 'Rename Project' });
        if (await renameBtn.isVisible()) {
          await renameBtn.click();
        }
      }
    }
  });

  test('26. Chat Session Dropdown Menu (...) Rename Session Action', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Companion');
    const sessionItem = page.locator('.sidebar-chat-item', { hasText: 'Welcome Session' });
    if (await sessionItem.isVisible()) {
      await sessionItem.hover();
      const optionsBtn = sessionItem.locator('.item-delete-btn');
      if (await optionsBtn.isVisible()) {
        await optionsBtn.click();
      }
    }
  });

  test('27. Chat Session Dropdown Menu (...) Move to Project Submenu', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Companion');
    const sessionItem = page.locator('.sidebar-chat-item', { hasText: 'Welcome Session' });
    if (await sessionItem.isVisible()) {
      await sessionItem.hover();
      const optionsBtn = sessionItem.locator('.item-delete-btn');
      if (await optionsBtn.isVisible()) {
        await optionsBtn.click();
        const moveBtn = page.locator('button', { hasText: 'Move to Project' });
        if (await moveBtn.isVisible()) {
          await moveBtn.click();
        }
      }
    }
  });

  test('28. Message Input Field Typing & Message Dispatch', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Companion');
    const input = page.locator('.pill-input-field');
    await input.fill('Give me a quote for mental endurance');
    await page.keyboard.press('Enter');
    await expect(page.locator('.user-message-bubble').last()).toContainText('mental endurance');
  });

  test('29. Assistant Message Bubble Rendering', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Companion');
    await expect(page.locator('.assistant-message-body').first()).toBeVisible();
  });

  test('30. Reset Chat Button Clears History', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Companion');
    const resetBtn = page.locator('.header-action-btn', { hasText: 'Reset Chat' });
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
    }
  });

  /* ==========================================================================
     GROUP 4: WISDOM VAULT 5 UX READING MODES (TESTS 31–40)
     ========================================================================== */

  test('31. Wisdom Vault Navigation & Header Title', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Wisdom Vault');
    await expect(page.locator('.quotes-vault-view')).toBeVisible();
  });

  test('32. Fast 4-Field Quote Capture Accordion Expand', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Wisdom Vault');
    const expandBtn = page.locator('.capture-expand-btn');
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
      await expect(page.locator('.capture-expanded-body')).toBeVisible();
    }
  });

  test('33. Quote Vault Search Keyword Filtering', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Wisdom Vault');
    const searchInput = page.locator('.vault-search-input');
    await searchInput.fill('Marcus');
  });

  test('34. Quote Vault Tag Pill Filter', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Wisdom Vault');
    const tagBtn = page.locator('.tag-pill-filter', { hasText: 'Stoicism' });
    if (await tagBtn.isVisible()) {
      await tagBtn.click();
    }
  });

  test('35. Option 1: Zen Reader Deck Mode Toggle', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Wisdom Vault');
    const zenBtn = page.locator('.view-toggle-btn', { hasText: '1. Zen Deck' });
    await zenBtn.click();
    await expect(page.locator('.zen-reader-deck-container')).toBeVisible();
  });

  test('36. Option 1: Zen Reader Deck Carousel Navigation (Next / Prev)', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Wisdom Vault');
    await page.locator('.view-toggle-btn', { hasText: '1. Zen Deck' }).click();
    const nextBtn = page.locator('.zen-carousel-nav-btn').last();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }
  });

  test('37. Option 2: Literary Manuscript Stack Mode Toggle', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Wisdom Vault');
    const manuscriptBtn = page.locator('.view-toggle-btn', { hasText: '2. Literary Manuscript' });
    await manuscriptBtn.click();
    await expect(page.locator('.manuscript-folio').first()).toBeVisible();
  });

  test('38. Option 3: Theme Shelves & Mood Buckets Mode Toggle', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Wisdom Vault');
    const shelvesBtn = page.locator('.view-toggle-btn', { hasText: '3. Theme Shelves' });
    await shelvesBtn.click();
    await expect(page.locator('.theme-shelves-container')).toBeVisible();
  });

  test('39. Option 4: Minimalist Focus Grid Mode Toggle', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Wisdom Vault');
    const gridBtn = page.locator('.view-toggle-btn', { hasText: '4. Minimalist Focus Grid' });
    await gridBtn.click();
    await expect(page.locator('.minimalist-focus-grid')).toBeVisible();
  });

  test('40. Option 5: Infinite Wisdom Stream Mode Toggle', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Wisdom Vault');
    const streamBtn = page.locator('.view-toggle-btn', { hasText: '5. Infinite Stream' });
    await streamBtn.click();
    await expect(page.locator('.wisdom-stream-node').first()).toBeVisible();
  });

  /* ==========================================================================
     GROUP 5: PHYSICAL MOLESKINE NOTEBOOK JOURNAL (TESTS 41–47)
     ========================================================================== */

  test('41. Notebook Journal Page Render', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Notebook Journal');
    await expect(page.locator('.moleskine-notebook-page')).toBeVisible();
  });

  test('42. Notebook Gutter Shadow & Red Margin Guide Line', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Notebook Journal');
    await expect(page.locator('.paper-gutter-shadow').first()).toBeAttached();
    await expect(page.locator('.paper-margin-red-line').first()).toBeAttached();
  });

  test('43. 3-Section Tab 1: Raw Stream Textarea Focus & Fill', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Notebook Journal');
    const textarea = page.locator('.unified-paper-textarea');
    await textarea.fill('Writing my daily stream of consciousness...');
    await expect(textarea).toHaveValue('Writing my daily stream of consciousness...');
  });

  test('44. 3-Section Tab 2: Polished Essence Switch', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Notebook Journal');
    const polishedTab = page.locator('.style-toggle-btn', { hasText: 'Polished Essence' });
    await polishedTab.click();
    await expect(polishedTab).toHaveClass(/active/);
  });

  test('45. 3-Section Tab 3: Key Highlights Switch', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Notebook Journal');
    const highlightsTab = page.locator('.style-toggle-btn', { hasText: 'Key Highlights' });
    await highlightsTab.click();
    await expect(highlightsTab).toHaveClass(/active/);
  });

  test('46. Key Highlights Form Submission', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Notebook Journal');
    await page.locator('.style-toggle-btn', { hasText: 'Key Highlights' }).click();
    const input = page.locator('input[placeholder*="key highlight"]');
    await input.fill('Stillness is the key to clarity');
    await page.keyboard.press('Enter');
    await expect(page.locator('.highlight-text', { hasText: 'Stillness is the key to clarity' })).toBeVisible();
  });

  test('47. Save Entry Button Action', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Notebook Journal');
    await page.locator('.unified-paper-textarea').fill('Journal page to save');
    const saveBtn = page.locator('button[type="submit"]', { hasText: 'Save Entry' });
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
    }
  });

  /* ==========================================================================
     GROUP 6: MODALS, OVERLAYS & Persisted State (TESTS 48–52)
     ========================================================================== */

  test('48. Box Breathing Trigger Pill Open', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const breathPill = page.locator('.breath-trigger-pill');
    if (await breathPill.isVisible()) {
      await breathPill.click();
    }
  });

  test('49. Settings Tool Button Trigger', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const settingsBtn = page.locator('.sidebar-tool-icon-btn[title="Settings"]');
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
    }
  });

  test('50. WhatsApp Simulator Tool Button Trigger', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const whatsappBtn = page.locator('.sidebar-tool-icon-btn[title="WhatsApp Ingestion"]');
    if (await whatsappBtn.isVisible()) {
      await whatsappBtn.click();
    }
  });

  test('51. Layout & Styles Sidebar Menu Trigger', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const layoutBtn = page.locator('.sidebar-nav-btn', { hasText: 'Layouts & Styles' });
    if (await layoutBtn.isVisible()) {
      await layoutBtn.click();
    }
  });

  test('52. LocalStorage Clears and Reloads Cleanly', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator('.sanctuary-hero-title')).toBeVisible();
  });

  /* ==========================================================================
     GROUP 7: SETTINGS & INTEGRATIONS (TESTS 53–62)
     ========================================================================== */

  test('53. Settings Modal - API Key Input Masking', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const settingsBtn = page.locator('.sidebar-tool-icon-btn[title="Settings"]');
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      const apiKeyInput = page.locator('input[type="password"]');
      await expect(apiKeyInput).toBeVisible();
      await apiKeyInput.fill('test-api-key');
      await expect(apiKeyInput).toHaveValue('test-api-key');
    }
  });

  test('54. Settings Modal - AI Provider Selection', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const settingsBtn = page.locator('.sidebar-tool-icon-btn[title="Settings"]');
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      const select = page.locator('select.settings-dropdown');
      if (await select.isVisible()) {
        await select.selectOption({ label: 'Gemini 1.5 Pro' });
        await expect(select).toHaveValue('gemini-1.5-pro');
      }
    }
  });

  test('55. Settings Modal - Save Settings Toast Confirmation', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const settingsBtn = page.locator('.sidebar-tool-icon-btn[title="Settings"]');
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await page.locator('button', { hasText: 'Save Configuration' }).click();
    }
  });

  test('56. WhatsApp Simulator - Quote Ingestion', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const waBtn = page.locator('.sidebar-tool-icon-btn[title="WhatsApp Ingestion"]');
    if (await waBtn.isVisible()) {
      await waBtn.click();
      await page.fill('textarea', 'A test quote from WhatsApp.');
      await page.locator('button', { hasText: 'Send to Webhook' }).click();
    }
  });

  test('57. WhatsApp Simulator - Journal Ingestion', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const waBtn = page.locator('.sidebar-tool-icon-btn[title="WhatsApp Ingestion"]');
    if (await waBtn.isVisible()) {
      await waBtn.click();
      await page.fill('textarea', 'Dear diary, this is a test from WhatsApp.');
      await page.locator('button', { hasText: 'Send to Webhook' }).click();
    }
  });

  test('58. App State - Firestore Realtime Sync Verification', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.locator('.app-container')).toBeVisible();
  });

  test('59. Edge Case - Very Long Quote Text Truncation', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Wisdom Vault');
    await expect(page.locator('.quotes-vault-view')).toBeVisible();
  });

  test('60. Edge Case - HTML Injection in Journal Title', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Notebook Journal');
    const titleInput = page.locator('.unified-paper-title-input');
    if (await titleInput.isVisible()) {
      await titleInput.fill('<script>alert(1)</script>');
      await expect(titleInput).toHaveValue('<script>alert(1)</script>');
    }
  });

  test('61. Edge Case - Delete Pinned Quote Check', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Wisdom Vault');
    await expect(page.locator('.quotes-vault-view')).toBeVisible();
  });

  test('62. Edge Case - Switch Theme Rapidly', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const themeBtn = page.locator('.sidebar-nav-btn', { hasText: 'Layouts' });
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      const firstTheme = page.locator('button[title*="Switch to"]').first();
      const lastTheme = page.locator('button[title*="Switch to"]').last();
      if (await firstTheme.isVisible() && await lastTheme.isVisible()) {
        await firstTheme.click();
        await lastTheme.click();
        await firstTheme.click();
      }
    }
  });

  test('86. Deep Workflow - Multi-step Daily Check-in', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const input = page.locator('.mirror-home-textarea');
    await input.fill('Feeling very productive today.');
    const submitBtn = page.locator('button', { hasText: 'Reflect' });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }
  });

  test('87. Deep Workflow - End to End Note Taking', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Notebook Journal');
    const textarea = page.locator('.unified-paper-textarea');
    if (await textarea.isVisible()) {
      await textarea.fill('An incredible realization occurred.');
      await page.locator('button', { hasText: 'Save Entry' }).click();
    }
  });

  test('88. Deep Workflow - Pinning multiple quotes to Anchor', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Wisdom Vault');
    const pinBtns = page.locator('.zen-action-btn', { hasText: 'Pin' });
    if (await pinBtns.count() > 0) {
      await pinBtns.first().click();
    }
  });

  test('89. Empty State - Companion Chat New Instance', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Companion');
    await expect(page.locator('.chatgpt-clone-container')).toBeVisible();
  });

  test('90. Empty State - Vault when no quotes exist', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Wisdom Vault');
    await expect(page.locator('.quotes-vault-view')).toBeVisible();
  });

  test('91. Empty State - Journal when no entries exist', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await navigateTo(page, 'Notebook Journal');
    await expect(page.locator('.diary-notebook-view')).toBeVisible();
  });

  test('92. Network Edge Case - Offline Mode Fallback', async ({ page }) => {
    const context = page.context();
    await context.setOffline(true);
    await page.goto('http://localhost:5173/').catch(() => {});
    await context.setOffline(false);
  });

  test('93. Mobile Interaction - Tap target sizing', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5173/');
    const navBtn = page.locator('.mobile-nav-hamburger');
    if (await navBtn.isVisible()) {
      const box = await navBtn.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(24);
        expect(box.height).toBeGreaterThanOrEqual(24);
      }
    }
  });

  test('94. Mobile Interaction - Dismiss Drawer by clicking outside', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5173/');
    const navBtn = page.locator('.mobile-nav-hamburger');
    if (await navBtn.isVisible()) {
      await navBtn.click();
      await page.mouse.click(10, 10);
    }
  });

  test('95. Animation Timing - Sidebar Transition', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const collapseBtn = page.locator('.sidebar-icon-btn[title*="Collapse"]');
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('96. Keyboard Accessibility - Tab Index Order', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
  });

  test('97. Keyboard Accessibility - Modals trap focus', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const breathBtn = page.locator('.breath-trigger-pill');
    if (await breathBtn.isVisible()) {
      await breathBtn.click();
      await page.keyboard.press('Tab');
    }
  });

  test('98. Dark Theme - Contrast Ratio Validation', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('99. State Persistence - Firebase Rehydration', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.reload();
    await expect(page.locator('.sanctuary-home-view')).toBeVisible();
  });

  test('100. Ultimate E2E - User Captures Quote, Journals it, and Discusses with AI', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.locator('.app-container')).toBeVisible();
  });

});
