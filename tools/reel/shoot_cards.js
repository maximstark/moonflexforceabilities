/* Screenshots the three title cards at 1080x1920 -> tools/reel/out/cards/.
 * Usage: node tools/reel/shoot_cards.js  (no server needed — file:// pages) */
const { chromium } = require("C:/Users/Mercardib/pw-drive/node_modules/playwright");
const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "out", "cards");
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const card of ["card1", "card2", "card3"]) {
    await page.goto("file:///" + path.join(__dirname, "cards", card + ".html").replace(/\\/g, "/"));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, card + ".png") });
    console.log("shot", card);
  }
  await browser.close();
})();
