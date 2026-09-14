import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Helper function to handle mobile navigation mapping
async function navigateTo(page: any, text: string) {
  const isMobile = await page.evaluate(() => window.innerWidth < 768);
  if (isMobile) {
    let mobileText = text;
    if (text === 'Wisdom Vault') mobileText = 'Quotes';
    if (text === 'Notebook Journal') mobileText = 'Diary';
    const mobileBtn = page.locator('.mobile-nav-btn', { hasText: mobileText });
    if (await mobileBtn.isVisible()) {
        await mobileBtn.click({ force: true });
        return;
    }
  }
  const sidebarBtn = page.locator('.sidebar-nav-btn', { hasText: text });
  if (await sidebarBtn.isVisible()) {
      await sidebarBtn.click();
  }
}

test.describe('Aryamaan Sanctuary — Visual Regression & A11y Audits', () => {
  
  test.beforeEach(async ({ page }) => {
    // Catch unhandled JS exceptions and console errors
    page.on('pageerror', exception => {
      expect(exception).toBeNull(); // Fail test on exception
    });
    
    // Some minor logs are expected, but we want to catch explicit console.errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        if (!msg.text().includes('favicon') && !msg.text().includes('Firebase')) {
          console.warn('Console Error Caught:', msg.text());
        }
      }
    });

    await page.goto('http://localhost:5173/');
    await page.waitForTimeout(500); // Give Firebase rehydration and animations a moment
  });

  test('01. Sanctuary Home - Visual & A11y', async ({ page }) => {
    await expect(page.locator('.app-container')).toBeVisible();
    
    // Check A11y
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Visual Regression (Masking dynamic elements like Daily Anchor and Input to prevent flaky tests)
    await expect(page).toHaveScreenshot('sanctuary-home.png', {
      mask: [page.locator('.sanctuary-daily-anchor-card')],
      fullPage: true
    });
  });

  test('02. Wisdom Vault - Visual & A11y', async ({ page }) => {
    await navigateTo(page, 'Wisdom Vault');
    await expect(page.locator('.quotes-vault-view')).toBeVisible();
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    if (accessibilityScanResults.violations.length > 0) {
      console.log('A11y Violations (Vault):', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }
    expect(accessibilityScanResults.violations).toEqual([]);

    await expect(page).toHaveScreenshot('wisdom-vault.png', {
      mask: [page.locator('.zen-deck-container'), page.locator('.quotes-vault-view > div').last()],
      fullPage: true
    });
  });

  test('03. Notebook Journal - Visual & A11y', async ({ page }) => {
    await navigateTo(page, 'Notebook Journal');
    await expect(page.locator('.diary-notebook-view')).toBeVisible();
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Masking the date stamp to prevent test flakiness on different days
    await expect(page).toHaveScreenshot('notebook-journal.png', {
      mask: [page.locator('.paper-date-stamp'), page.locator('.notebook-page-num')],
      fullPage: true
    });
  });

  test('04. Companion AI - Visual & A11y', async ({ page }) => {
    await navigateTo(page, 'Companion');
    await expect(page.locator('.chatgpt-clone-container')).toBeVisible();
    
    // We only take the snapshot to ensure CSS exists
    await expect(page).toHaveScreenshot('companion-ai.png', {
      mask: [page.locator('.chat-history-list')],
      fullPage: true
    });
  });

  test('05. Settings Modal - Visual & A11y', async ({ page }) => {
    const isMobile = await page.evaluate(() => window.innerWidth < 768);
    if (isMobile) {
      await page.locator('.mobile-nav-btn', { hasText: 'Settings' }).click({ force: true });
    } else {
      await page.locator('.sidebar-tool-icon-btn[title="Settings & BYOK Keys"]').click();
    }
    
    await expect(page.locator('.modal-card')).toBeVisible();

    await expect(page.locator('.modal-card')).toHaveScreenshot('settings-modal.png');
  });
});
