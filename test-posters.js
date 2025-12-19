const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Testing LOCAL site with poster frames...\n');

  await page.goto('http://localhost:8081/property.html?id=harrow', { timeout: 30000 });
  await page.waitForTimeout(2000);

  // Scroll to gallery
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(2000);

  const videoStatus = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('video'));
    return videos.map((v, i) => ({
      index: i + 1,
      src: v.src.split('/').pop(),
      poster: v.poster,
      hasPoster: !!v.poster,
      posterSrc: v.poster ? v.poster.split('/').pop() : 'NONE'
    }));
  });

  console.log('Video Poster Status:', JSON.stringify(videoStatus, null, 2));

  const allHavePosters = videoStatus.every(v => v.hasPoster);
  console.log(`\n${allHavePosters ? '✅ ALL VIDEOS HAVE POSTERS!' : '❌ Some videos missing posters'}`);

  await page.screenshot({ path: '/tmp/test-with-posters.png' });
  console.log('\nScreenshot: /tmp/test-with-posters.png');

  console.log('\nBrowser will stay open for 15 seconds...');
  await page.waitForTimeout(15000);

  await browser.close();
})();
