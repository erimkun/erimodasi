import { test, expect, type Page, type Locator } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

async function dragScene(page: Page, fromX: number, fromY: number, toX: number, toY: number) {
  await page.mouse.move(fromX, fromY);
  await page.mouse.down({ button: 'left' });
  await page.mouse.move(toX, toY, { steps: 26 });
  await page.mouse.up({ button: 'left' });
}

async function clickModelUntilVisible(
  page: Page,
  viewerCanvas: Locator,
  points: Array<{ x: number; y: number }>,
  expectedVisible: Locator,
  modelName: string,
) {
  const box = await viewerCanvas.boundingBox();
  if (!box) throw new Error('Viewer canvas bounding box not available');

  for (const point of points) {
    // Clear potential previous overlays that may intercept clicks.
    if (await page.locator('.profile-popup-overlay').isVisible().catch(() => false)) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(120);
    }
    if (await page.locator('.terminal-popup-overlay').isVisible().catch(() => false)) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(120);
    }

    const x = box.x + box.width * point.x;
    const y = box.y + box.height * point.y;
    await page.mouse.click(x, y, { button: 'left' });

    try {
      await expect(expectedVisible).toBeVisible({ timeout: 1500 });
      return;
    } catch {
      // Try next point
    }
  }

  throw new Error(`${modelName} focus could not be triggered from candidate click points.`);
}

test('captures FPS with full user journey flow', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Start collecting FPS immediately (before "GIRIS"), so stage-1 and stage-2 are both included.
  await page.keyboard.press('f');

  const enterButton = page.locator('.enter-btn');
  await expect(enterButton).toBeVisible({ timeout: 45_000 });
  await page.waitForTimeout(1200);
  await enterButton.click();

  const viewerCanvas = page.locator('.viewer-canvas canvas').first();
  await expect(viewerCanvas).toBeVisible({ timeout: 30_000 });

  const box = await viewerCanvas.boundingBox();
  if (!box) throw new Error('Viewer canvas bounding box not available');

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  // 1) First drag after entering scene
  await page.waitForTimeout(1200);
  await dragScene(page, centerX - 230, centerY + 40, centerX + 230, centerY + 40);
  await page.waitForTimeout(900);

  // 2) Click main character -> zoom in -> close from top-right X
  await clickModelUntilVisible(
    page,
    viewerCanvas,
    [
      { x: 0.52, y: 0.45 },
      { x: 0.50, y: 0.44 },
      { x: 0.54, y: 0.44 },
      { x: 0.52, y: 0.49 },
      { x: 0.49, y: 0.47 },
      { x: 0.55, y: 0.47 },
    ],
    page.locator('.speech-bubble-container'),
    'main character',
  );
  await page.waitForTimeout(1800);
  try {
    await page.locator('.close-btn').click({ timeout: 1500 });
  } catch {
    await page.keyboard.press('Escape');
  }

  // 3) Click "erim writing" model -> close with X
  await page.waitForTimeout(1400);
  await clickModelUntilVisible(
    page,
    viewerCanvas,
    [
      { x: 0.60, y: 0.31 },
      { x: 0.58, y: 0.32 },
      { x: 0.62, y: 0.32 },
      { x: 0.60, y: 0.35 },
      { x: 0.57, y: 0.36 },
      { x: 0.63, y: 0.36 },
      { x: 0.66, y: 0.33 },
      { x: 0.55, y: 0.33 },
    ],
    page.locator('.profile-popup-overlay'),
    'writing model',
  );
  await page.waitForTimeout(1500);
  await page.locator('.profile-popup-close').click();

  // 4) Final scene drag left-right
  await page.waitForTimeout(1000);
  await dragScene(page, centerX + 210, centerY + 30, centerX - 210, centerY + 30);
  await page.waitForTimeout(1200);

  // 5) L for output, then stop logger with F so __FPS_TOOL__ snapshot is finalized.
  await page.keyboard.press('f');
  await page.waitForTimeout(350);
  await page.keyboard.press('f');
  await page.waitForTimeout(300);

  const payload = await page.evaluate(() => window.__FPS_TOOL__ ?? null);
  expect(payload).toBeTruthy();

  const outputDir = join(process.cwd(), 'perf-results');
  mkdirSync(outputDir, { recursive: true });

  const now = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = join(outputDir, `fps-playwright-${now}.json`);
  writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');

  console.log(`[perf] saved: ${filePath}`);
});
