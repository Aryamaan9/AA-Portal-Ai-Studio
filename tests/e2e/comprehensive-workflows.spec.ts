import { test, expect } from '@playwright/test';

test.describe('Sanctuary — Comprehensive E2E Test Suite (Web & Mobile)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local dev server
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  // =========================================================================
  // WORKFLOW 1: SANCTUARY HOME & GROUNDING
  // =========================================================================
  test('WF-1: Sanctuary Home, Daily Anchor & Grounding Breath', async ({ page, isMobile }) => {
    // 1. Verify Hero & Branding
    await expect(page.locator('.sanctuary-hero-title')).toBeVisible();
    await expect(page.locator('.sanctuary-hero-title')).toContainText('Quiet your mind');

    // 2. Daily Anchor Card
    const anchorCard = page.locator('.sanctuary-daily-anchor-card');
    await expect(anchorCard).toBeVisible();
    await expect(anchorCard.locator('.anchor-quote-serif')).toBeVisible();

    // 3. Grounding Breath Modal
    // Trigger from button in anchor card or mobile header
    const breathBtn = isMobile
      ? page.locator('.mobile-header-icon-btn[title="Grounding Breath"]')
      : page.locator('.breath-trigger-pill').first();

    if (await breathBtn.isVisible()) {
      await breathBtn.click();
      // Verify BreathModal is open
      const breathContent = page.locator('.breath-modal-content');
      await expect(breathContent).toBeVisible();
      await expect(page.getByText('Box Breathing')).toBeVisible();
      // Close breath modal
      await page.locator('button', { hasText: 'Finished Grounding' }).click();
      await expect(breathContent).not.toBeVisible();
    }

    // 4. Mind Mirror Interaction
    const mirrorInput = page.locator('.mirror-home-textarea');
    if (await mirrorInput.isVisible()) {
      await mirrorInput.fill('Feeling steady and centered today.');
      // Click a mood chip
      const chip = page.locator('.mood-prompt-chip').first();
      if (await chip.isVisible()) {
        await chip.click();
      }
      // Submit reflection
      const submitBtn = page.locator('.mirror-submit-btn');
      await submitBtn.click();

      // Submitting mind mirror routes user to companion view
      await expect(page.locator('.chatgpt-clone-container')).toBeVisible({ timeout: 10000 });
    }
  });

  // =========================================================================
  // WORKFLOW 2: QUOTES VAULT 5 READING MODES & CAPTURE
  // =========================================================================
  test('WF-2: Wisdom Vault 5 UX Modes, Search & Fast Capture', async ({ page, isMobile }) => {
    // Navigate to Quotes
    if (isMobile) {
      await page.locator('.mobile-nav-btn', { hasText: 'Quotes' }).click();
    } else {
      const desktopBtn = page
        .locator('.sidebar-nav-btn', { hasText: 'Wisdom Vault' })
        .or(page.locator('.top-nav-btn', { hasText: 'Wisdom Vault' }))
        .first();
      await desktopBtn.click();
    }

    await expect(page.locator('.quotes-vault-view')).toBeVisible();

    // Fast Capture a quote
    const captureInput = page.locator('.capture-main-input');
    await expect(captureInput).toBeVisible();
    await captureInput.fill('The soul becomes dyed with the color of its thoughts.');
    const saveBtn = page.locator('button[type="submit"]', { hasText: 'Save' });
    await saveBtn.click();

    // Verify 5 UX Reading Modes Switcher
    // Mode 1: Zen Deck
    const zenBtn = page.locator('.view-toggle-btn', { hasText: '1. Zen Deck' });
    if (await zenBtn.isVisible()) {
      await zenBtn.click();
      await expect(page.locator('.zen-reader-deck-container')).toBeVisible();
    }

    // Mode 2: Literary Manuscript
    const manuscriptBtn = page.locator('.view-toggle-btn', { hasText: '2. Literary Manuscript' });
    if (await manuscriptBtn.isVisible()) {
      await manuscriptBtn.click();
      await expect(page.locator('.manuscript-folios-list')).toBeVisible();
    }

    // Mode 3: Theme Shelves
    const shelvesBtn = page.locator('.view-toggle-btn', { hasText: '3. Theme Shelves' });
    if (await shelvesBtn.isVisible()) {
      await shelvesBtn.click();
      await expect(page.locator('.theme-shelves-container')).toBeVisible();
    }

    // Mode 4: Minimalist Focus Grid
    const gridBtn = page.locator('.view-toggle-btn', { hasText: '4. Minimalist Grid' });
    if (await gridBtn.isVisible()) {
      await gridBtn.click();
      await expect(page.locator('.minimalist-focus-grid')).toBeVisible();
    }

    // Mode 5: Infinite Stream
    const streamBtn = page.locator('.view-toggle-btn', { hasText: '5. Infinite Stream' });
    if (await streamBtn.isVisible()) {
      await streamBtn.click();
      await expect(page.locator('.infinite-wisdom-stream')).toBeVisible();
    }

    // Test Search Input
    const searchInput = page.locator('.vault-search-input');
    await searchInput.fill('soul');
    await page.waitForTimeout(300);
    expect(await searchInput.inputValue()).toBe('soul');
    await searchInput.clear();
  });

  // =========================================================================
  // WORKFLOW 3: SCREENSHOT & GALLERY INGESTION
  // =========================================================================
  test('WF-3: Screenshot & Gallery Ingestion Flow', async ({ page, isMobile }) => {
    // Open screenshot ingestion modal
    if (isMobile) {
      const cameraHeaderBtn = page.locator('.mobile-header-icon-btn[title*="Screenshot"]');
      if (await cameraHeaderBtn.isVisible()) {
        await cameraHeaderBtn.click();
      } else {
        await page.locator('.mobile-nav-btn', { hasText: 'Quotes' }).click();
        await page.locator('button', { hasText: 'Capture from Screenshot' }).click();
      }
    } else {
      const quotesNav = page
        .locator('.sidebar-nav-btn', { hasText: 'Wisdom Vault' })
        .or(page.locator('.top-nav-btn', { hasText: 'Wisdom Vault' }))
        .first();
      await quotesNav.click();
      await page.locator('button', { hasText: 'Capture from Screenshot' }).click();
    }

    // Disambiguated Modal Title
    await expect(page.locator('.modal-title', { hasText: 'Capture from Screenshot' })).toBeVisible();

    // Verify Mobile Native Action Buttons
    await expect(page.getByText('Choose from Gallery / Screenshots')).toBeVisible();
    await expect(page.getByText('Take Photo with Camera')).toBeVisible();
    await expect(page.getByText('Paste from Clipboard')).toBeVisible();

    // Close modal via close button or Cancel
    const closeBtn = page.locator('.modal-close-btn');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await expect(page.locator('.modal-title', { hasText: 'Capture from Screenshot' })).not.toBeVisible();
  });

  // =========================================================================
  // WORKFLOW 4: DIARY NOTEBOOK JOURNAL
  // =========================================================================
  test('WF-4: Diary Notebook Journal & Reflection', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.locator('.mobile-nav-btn', { hasText: 'Diary' }).click();
    } else {
      const diaryNav = page
        .locator('.sidebar-nav-btn', { hasText: 'Notebook Journal' })
        .or(page.locator('.top-nav-btn', { hasText: 'Diary' }))
        .first();
      await diaryNav.click();
    }

    // Verify Moleskine notebook structure
    await expect(page.locator('.diary-notebook-view')).toBeVisible();
    await expect(page.locator('.moleskine-notebook-page')).toBeVisible();

    // Check raw thought stream textarea
    const streamInput = page.locator('.unified-paper-textarea');
    await expect(streamInput).toBeVisible();
    await streamInput.fill('Evening reflection: A quiet, productive day of deep coding.');

    // Save Entry
    const saveBtn = page.locator('.notebook-save-btn');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();
  });

  // =========================================================================
  // WORKFLOW 5: COMPANION AI CHAT & MOBILE DRAWER
  // =========================================================================
  test('WF-5: Companion AI Messaging & Mobile Sidebar Drawer', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.locator('.mobile-nav-btn', { hasText: 'Companion' }).click();
    } else {
      const companionNav = page.locator('.sidebar-nav-btn', { hasText: 'Companion' });
      if (await companionNav.isVisible()) await companionNav.click();
    }

    await expect(page.locator('.chatgpt-clone-container')).toBeVisible();

    // Send a message
    const chatInput = page.locator('.chat-input-textarea');
    await expect(chatInput).toBeVisible();
    await chatInput.fill('Share a perspective on dealing with uncertainty.');

    const sendBtn = page.locator('.chat-send-icon-btn');
    await sendBtn.click();

    // Verify user bubble rendered
    await expect(page.locator('.chat-bubble-user').last()).toContainText('uncertainty');

    // On mobile: test sidebar drawer opening & closing
    if (isMobile) {
      const menuBtn = page.locator('.sidebar-icon-btn[title*="Chats"]');
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
        // Verify sidebar has .open class
        await expect(page.locator('.chatgpt-clone-sidebar')).toHaveClass(/open/);
        // Verify backdrop is visible
        const backdrop = page.locator('.chatgpt-sidebar-backdrop');
        await expect(backdrop).toBeVisible();
        // Tap backdrop to close
        await backdrop.click();
        await expect(page.locator('.chatgpt-clone-sidebar')).not.toHaveClass(/open/);
      }
    }
  });

  // =========================================================================
  // WORKFLOW 6: VISUAL CUSTOMIZATION & THEME SWITCHER
  // =========================================================================
  test('WF-6: Visual Customization Drawer & Theme Switch', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.locator('.mobile-header-icon-btn[title*="Customize"]').or(page.locator('.mobile-header-icon-btn[title*="Theme"]')).first().click();
    } else {
      const toolBtn = page
        .locator('.sidebar-tool-icon-btn[title*="Customization"]')
        .or(page.locator('.sidebar-nav-btn', { hasText: 'Layouts & Styles' }))
        .or(page.locator('.header-tool-btn[title*="Customization"]'))
        .first();
      await toolBtn.click();
    }

    // Verify Customization modal
    await expect(page.locator('.modal-title', { hasText: 'Visual Customization' })).toBeVisible();

    // Check tabs (8 Color Atmospheres vs 4 Structure Layouts)
    await expect(page.locator('.switcher-tab-btn', { hasText: '8 Color Atmospheres' })).toBeVisible();
    await expect(page.locator('.switcher-tab-btn', { hasText: '4 Structure Layouts' })).toBeVisible();

    // Theme choices
    const themeCard = page.locator('.switcher-choice-card', { hasText: 'Grounded Sage' }).first();
    await expect(themeCard).toBeVisible();
    await themeCard.click();

    // Close modal
    const closeBtn = page.locator('.modal-close-btn');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await expect(page.locator('.modal-title', { hasText: 'Visual Customization' })).not.toBeVisible();
  });

  // =========================================================================
  // WORKFLOW 7: SETTINGS MODAL & CONFIGURATION
  // =========================================================================
  test('WF-7: Settings Modal & Configuration', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.locator('.mobile-nav-btn', { hasText: 'Settings' }).click();
    } else {
      const settingsBtn = page
        .locator('.sidebar-tool-icon-btn[title*="Settings"]')
        .or(page.locator('.header-tool-btn[title*="Settings"]'))
        .first();
      await settingsBtn.click();
    }

    // Verify Settings Modal title
    await expect(page.locator('.modal-title', { hasText: 'Sanctuary Settings' })).toBeVisible();

    // Check Settings Tabs (AI Models & BYOK, Profile & Backup, Cloud Sync)
    await expect(page.getByText('AI Models & BYOK')).toBeVisible();
    await expect(page.getByText('Profile & Backup')).toBeVisible();
    await expect(page.getByText('Cloud Sync')).toBeVisible();

    // Close Settings
    const closeBtn = page.locator('.modal-close-btn');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await expect(page.locator('.modal-title', { hasText: 'Sanctuary Settings' })).not.toBeVisible();
  });

  // =========================================================================
  // WORKFLOW 8: MOBILE ERGONOMICS & NO HORIZONTAL OVERFLOW
  // =========================================================================
  test('WF-8: Mobile Responsiveness & Zero Horizontal Overflow', async ({ page, isMobile }) => {
    if (!isMobile) return;

    // Check that Sanctuary view fits horizontally without horizontal scrolling
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Verify Mobile Navigation bar is fixed at bottom
    const mobileNav = page.locator('.sanctuary-mobile-nav-bar');
    await expect(mobileNav).toBeVisible();

    // Verify all 5 navigation buttons exist and have adequate touch targets (>= 40px)
    const navButtons = page.locator('.mobile-nav-btn');
    expect(await navButtons.count()).toBe(5);

    for (let i = 0; i < 5; i++) {
      const btn = navButtons.nth(i);
      const box = await btn.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});
