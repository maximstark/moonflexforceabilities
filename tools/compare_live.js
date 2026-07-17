const { chromium } = require('C:/Users/Mercardib/pw-drive/node_modules/playwright');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'docs', 'comparison');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const [name, url] of [
    ['original', 'https://maximstark.github.io/moonflexforceabilities/'],
    ['v2', 'https://maximstark.github.io/moonflexforceabilities-v2/'],
  ]) {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.locator('#game').screenshot({ path: path.join(OUT, `${name}-title.png`) });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(350);
    await page.locator('#game').screenshot({ path: path.join(OUT, `${name}-map.png`) });
  }
  await browser.close();
  console.log(`Captured original/V2 comparison in ${OUT}`);
})().catch(error => { console.error(error); process.exit(1); });
