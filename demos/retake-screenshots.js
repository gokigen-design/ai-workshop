const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const OUTDIR = path.join(__dirname, 'images/ref-screenshots');

const failed = [
  { file: 'sp-elle-tasaki',        url: 'https://sp.elle.co.jp/fashion/tasaki/2010/' },
  { file: 'sp-rageblue',           url: 'https://www.dot-st.com/rageblue/cp/magicink' },
  { file: 'sp-beamsmini',          url: 'https://www.beams.co.jp/special/beamsmini/kids_7days/' },
  { file: 'sp-beams-citydwellers', url: 'https://www.beams.co.jp/special/bmingbybeams/citydwellers/' },
  { file: 'sp-izawa-internship',   url: 'https://izawasyouten.jp/recruit/internship/' },
];

const spViewport = { width: 375, height: 812 };
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const site of failed) {
    const outPath = path.join(OUTDIR, site.file + '.jpg');
    // 既存を削除して再取得
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
      // タイムアウトを長めに・networkidle で待つ
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
      // エラーでも部分スクショを試みる
      try {
        await page.screenshot({
          path: outPath,
          clip: { x: 0, y: 0, width: 375, height: 812 },
          type: 'jpeg', quality: 88,
        });
        const size = fs.statSync(outPath).size;
        console.log(`PARTIAL ${site.file} (${Math.round(size/1024)}KB)`);
      } catch {
        console.log(`ERR ${site.file}: ${e.message.split('\n')[0]}`);
      }
    }
    await ctx.close();
  }

  await browser.close();
  console.log('\n完了！');
})();
