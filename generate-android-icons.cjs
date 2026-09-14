const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const sizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const svgPath = path.resolve(__dirname, 'public', 'favicon.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf-8');

  for (const { folder, size } of sizes) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { background: #FAF8F5; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; }
          </style>
        </head>
        <body>
          ${svgContent.replace('<svg ', '<svg width="' + size + '" height="' + size + '" ')}
        </body>
      </html>
    `);
    const outDir = path.resolve(__dirname, 'android', 'app', 'src', 'main', 'res', folder);
    if (fs.existsSync(outDir)) {
      await page.screenshot({ path: path.join(outDir, 'ic_launcher.png') });
      await page.screenshot({ path: path.join(outDir, 'ic_launcher_round.png') });
      await page.screenshot({ path: path.join(outDir, 'ic_launcher_foreground.png') });
    }
  }
  await browser.close();
  console.log('Android icons updated successfully!');
})();
