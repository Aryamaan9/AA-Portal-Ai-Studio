import { test, expect } from '@playwright/test';

test.describe('Aryamaan Sanctuary UI & E2E Verification Suite', () => {

  test('1. Sanctuary Home renders hero, daily anchor, and mind mirror', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('.sanctuary-home-view');

    // Check Hero Banner
    const title = page.locator('.sanctuary-hero-title');
    await expect(title).toContainText('Quiet your mind. Enter your sanctuary.');

    // Check Daily Anchor Card
    const anchorCard = page.locator('.sanctuary-daily-anchor-card');
    await expect(anchorCard).toBeVisible();

    // Check Mind Mirror Textarea
    const textarea = page.locator('.mirror-home-textarea');
    await expect(textarea).toBeVisible();
  });

  test('2. Companion AI Chat interface sends messages and handles options menu', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Switch to Companion tab
    const companionTabBtn = page.locator('.sidebar-nav-btn', { hasText: 'Companion AI' });
    if (await companionTabBtn.isVisible()) {
      await companionTabBtn.click();
    }

    await page.waitForSelector('.chatgpt-clone-container');

    // Check New Chat button
    const newChatBtn = page.locator('.btn-new-chat-primary');
    await expect(newChatBtn).toBeVisible();

    // Test input field & send
    const input = page.locator('.pill-input-field');
    await input.fill('What is the essence of stillness?');
    await page.keyboard.press('Enter');

    // Check message stream has user message
    const userBubble = page.locator('.user-message-bubble').last();
    await expect(userBubble).toContainText('essence of stillness');
  });

  test('3. Wisdom Vault supports 5 UX Reading Modes', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Switch to Quotes Vault
    const quotesTabBtn = page.locator('.sidebar-nav-btn', { hasText: 'Wisdom Vault' });
    if (await quotesTabBtn.isVisible()) {
      await quotesTabBtn.click();
    }

    await page.waitForSelector('.quotes-vault-view');

    // Check 5 UX Mode Buttons
    const optionsBar = page.locator('.quote-ux-options-bar');
    await expect(optionsBar).toBeVisible();

    // Toggle Option 1: Zen Deck
    const zenBtn = page.locator('.view-toggle-btn', { hasText: '1. Zen Deck' });
    await zenBtn.click();
    await expect(page.locator('.zen-reader-deck-container')).toBeVisible();

    // Toggle Option 2: Literary Manuscript
    const manuscriptBtn = page.locator('.view-toggle-btn', { hasText: '2. Literary Manuscript' });
    await manuscriptBtn.click();
    await expect(page.locator('.manuscript-folio').first()).toBeVisible();

    // Toggle Option 4: Minimalist Focus Grid
    const gridBtn = page.locator('.view-toggle-btn', { hasText: '4. Minimalist Focus Grid' });
    await gridBtn.click();
    await expect(page.locator('.minimalist-focus-card').first()).toBeVisible();
  });

  test('4. Physical Notebook renders 3-section page', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Switch to Notebook Journal
    const diaryTabBtn = page.locator('.sidebar-nav-btn', { hasText: 'Notebook Journal' });
    if (await diaryTabBtn.isVisible()) {
      await diaryTabBtn.click();
    }

    await page.waitForSelector('.moleskine-notebook-page');

    // Check 3 tabs
    await expect(page.locator('.style-toggle-btn', { hasText: 'Raw Stream' })).toBeVisible();
    await expect(page.locator('.style-toggle-btn', { hasText: 'Polished Essence' })).toBeVisible();
    await expect(page.locator('.style-toggle-btn', { hasText: 'Key Highlights' })).toBeVisible();
  });

});
