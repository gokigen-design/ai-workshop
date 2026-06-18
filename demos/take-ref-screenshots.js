const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const OUTDIR = path.join(__dirname, 'images/ref-screenshots');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

const spSites = [
  { file: 'sp-elle-tasaki',        url: 'https://sp.elle.co.jp/fashion/tasaki/2010/' },
  { file: 'sp-rageblue',           url: 'https://www.dot-st.com/rageblue/cp/magicink' },
  { file: 'sp-beamsmini',          url: 'https://www.beams.co.jp/special/beamsmini/kids_7days/' },
  { file: 'sp-juno-ropepicnic',    url: 'https://www.junonline.jp/special/ropepicnic_pino_collaboration/' },
  { file: 'sp-juno-onepiece',      url: 'https://www.junonline.jp/rope-picnic/product/onepiece/onepiece-dress/GDE14950' },
  { file: 'sp-pronovias',          url: 'https://www.pronovias-jp.com/' },
  { file: 'sp-ogiya-wedding',      url: 'https://ogiya-wedding.jp/' },
  { file: 'sp-elle-harrywinston',  url: 'https://sp.elle.co.jp/fashion/harrywinston/2206/' },
  { file: 'sp-beams-citydwellers', url: 'https://www.beams.co.jp/special/bmingbybeams/citydwellers/' },
  { file: 'sp-sundaymorning',      url: 'https://sundaymorning-f.com/' },
  { file: 'sp-elle-shiseido',      url: 'https://sp.elle.co.jp/beauty/shiseido/1905/' },
  { file: 'sp-botanist-26spring',  url: 'https://botanistofficial.com/special/limited/26spring/' },
  { file: 'sp-norikura-hanabi',    url: 'https://www.norikura-hanabi.com/' },
  { file: 'sp-twoe',               url: 'https://twoe.jp/' },
  { file: 'sp-noog',               url: 'https://noog.jp/pages/lp' },
  { file: 'sp-botanist-25spring',  url: 'https://botanistofficial.com/special/limited/25spring/' },
  { file: 'sp-izawa-internship',   url: 'https://izawasyouten.jp/recruit/internship/' },
  { file: 'sp-juno-ropepicnic2',   url: 'https://www.junonline.jp/special/ropepicnic_pino_collaboration/' },
  { file: 'sp-yolu',               url: 'https://yolu.jp/special/25renewal/' },
  { file: 'sp-femyou',             url: 'https://femyou.jp/' },
  { file: 'sp-botanist-25summer',  url: 'https://botanistofficial.com/special/limited/25summer/' },
];

const pcSites = [
  { file: 'pc-talanton',  url: 'https://talanton.jp/' },
  { file: 'pc-niaulab',   url: 'https://niaulab.com/' },
  { file: 'pc-culinary',  url: 'https://www.culinary.ac.jp/introduce/' },
  { file: 'pc-mygenius',  url: 'https://mygenius.jp/' },
];

const splpSites = [
  { file: 'splp-rdlp',        url: 'https://rdlp.jp/archives/otherdesign/lp/200150?sp=1&rdlp_flg=1' },
  { file: 'splp-skillskip',   url: 'https://skillskip.jp/lp17' },
  { file: 'splp-forwomengym', url: 'https://forwomenpersonalgym.com/' },
  { file: 'splp-oppen',       url: 'https://www.oppen-ec.com/products-ss/' },
  { file: 'splp-shelikes',    url: 'https://shelikes.jp/trial/' },
];

async function screenshotSite(browser, site, viewport, isMobile) {
  const outPath = path.join(OUTDIR, site.file + '.jpg');
  // すでに取れている場合はスキップ
  if (fs.existsSync(outPath)) {
    console.log(`SKIP ${site.file} (already exists)`);
    return;
  }
  const ctx = await browser.newContext({
    viewport,
    userAgent: isMobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    isMobile,
    deviceScaleFactor: isMobile ? 2 : 1,
    // HTTPSエラーを無視
    ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();
  try {
    await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    // リダイレクトが落ち着くまで少し待つ
    await page.waitForTimeout(2500);
    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: viewport.width, height: viewport.height },
      type: 'jpeg',
      quality: 88,
    });
    console.log(`OK  ${site.file}`);
  } catch (e) {
    // エラーでも取れた分だけ保存を試みる
    try {
      await page.screenshot({
        path: outPath,
        clip: { x: 0, y: 0, width: viewport.width, height: viewport.height },
        type: 'jpeg',
        quality: 88,
      });
      console.log(`OK(partial) ${site.file}`);
    } catch {
      console.log(`ERR ${site.file}: ${e.message.split('\n')[0]}`);
    }
  } finally {
    await ctx.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // スマホ (375×812) — SP + SPLP まとめて
  const spViewport = { width: 375, height: 812 };
  for (const site of [...spSites, ...splpSites]) {
    await screenshotSite(browser, site, spViewport, true);
  }

  // PC (1280×800)
  const pcViewport = { width: 1280, height: 800 };
  for (const site of pcSites) {
    await screenshotSite(browser, site, pcViewport, false);
  }

  await browser.close();
  console.log('\n全サイト完了！');
})();
