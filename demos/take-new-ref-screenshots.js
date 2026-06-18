const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const OUTDIR = path.join(__dirname, 'images/ref-screenshots');

const newSites = [
  { file: 'sp-novel-nightwork',    url: 'https://novel-group.co.jp/career-tag/occupation/nightwork' },
  { file: 'sp-irodori-branding',   url: 'https://mrk.irodori-branding.com/p/tU70pQnsIwjt?ftid=lm8Rl72qq7kv' },
  { file: 'sp-baycrews',           url: 'https://baycrews.jp/feature/detail/4489' },
  { file: 'sp-haruulala',          url: 'https://haruulala.life/earlyspring2025/' },
  { file: 'sp-peuconne',           url: 'https://peu-connunet.com/' },
  { file: 'sp-risuphoto',          url: 'https://risuphoto.com/lp/photo/' },
  { file: 'sp-soranohotel',        url: 'https://soranohotel.com/' },
  { file: 'sp-rillee',             url: 'https://rillee-on.com/' },
];

const spViewport = { width: 375, height: 812 };
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const site of newSites) {
    const outPath = path.join(OUTDIR, site.file + '.jpg');
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

    const ctx = await browser.newContext({
      viewport: spViewport,
      userAgent: UA,
      isMobile: true,
      deviceScaleFactor: 2,
      ignoreHTTPSErrors: true,
    });
    const page = await ctx.newPage();

    try {
      await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);
      await page.screenshot({
        path: outPath,
        clip: { x: 0, y: 0, width: 375, height: 812 },
        type: 'jpeg', quality: 88,
      });
      const size = fs.statSync(outPath).size;
      console.log(`OK  ${site.file} (${Math.round(size/1024)}KB)`);
    } catch (e) {
      try {
        await page.screenshot({
          path: outPath,
          clip: { x: 0, y: 0, width: 375, height: 812 },
          type: 'jpeg', quality: 88,
        });
        const size = fs.statSync(outPath).size;
        console.log(`PARTIAL  ${site.file} (${Math.round(size/1024)}KB)`);
      } catch {
        console.log(`ERR  ${site.file}: ${e.message.split('\n')[0]}`);
      }
    }
    await ctx.close();
  }

  await browser.close();
  console.log('\n完了！');
})();
