import { test, expect } from '@playwright/test';

test.describe('Aryamaan Sanctuary — Full User Journey & UI Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('1. Sanctuary Home Landing Page & Grounding', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Hero title
    await expect(page.locator('.sanctuary-hero-title')).toContainText('Quiet your mind. Enter your sanctuary.');

    // Daily Anchor Card
    await expect(page.locator('.sanctuary-daily-anchor-card')).toBeVisible();

    // Mind Mirror input
    const textarea = page.locator('.mirror-home-textarea');
    await expect(textarea).toBeVisible();
    await textarea.fill('Testing mind reflection state');
  });

  test('2. Companion AI Chat interface & messaging', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Navigate to Companion AI tab
    const companionNavBtn = page.locator('.sidebar-nav-btn', { hasText: 'Companion' });
    if (await companionNavBtn.isVisible()) {
      await companionNavBtn.click();
    }

    await expect(page.locator('.chatgpt-clone-container')).toBeVisible();

    // Verify New Chat button
    await expect(page.locator('.btn-new-chat-primary')).toBeVisible();

    // Type and send message
    const input = page.locator('.pill-input-field');
    await input.fill('What is Stoicism?');
    await page.keyboard.press('Enter');

    // Check message bubble rendered
    await expect(page.locator('.user-message-bubble').last()).toContainText('What is Stoicism?');
  });

  test('3. Wisdom Vault 5 UX Reading Modes', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    const quotesNavBtn = page.locator('.sidebar-nav-btn', { hasText: 'Wisdom Vault' });
    if (await quotesNavBtn.isVisible()) {
      await quotesNavBtn.click();
    }

    await expect(page.locator('.quotes-vault-view')).toBeVisible();

    // Test Zen Deck mode
    const zenBtn = page.locator('.view-toggle-btn', { hasText: '1. Zen Deck' });
    await zenBtn.click();
    await expect(page.locator('.zen-reader-deck-container')).toBeVisible();

    // Test Literary Manuscript mode
    const manuscriptBtn = page.locator('.view-toggle-btn', { hasText: '2. Literary Manuscript' });
    await manuscriptBtn.click();
    await expect(page.locator('.manuscript-folio').first()).toBeVisible();
  });

  test('4. Physical Moleskine Notebook Journal', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    const diaryNavBtn = page.locator('.sidebar-nav-btn', { hasText: 'Notebook Journal' });
    if (await diaryNavBtn.isVisible()) {
      await diaryNavBtn.click();
    }

    await expect(page.locator('.moleskine-notebook-page')).toBeVisible();
  });

});
