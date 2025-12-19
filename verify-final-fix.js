const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('=== VERIFYING PRODUCTION AFTER POSTER FIX ===\n');

  await page.goto('https://www.wrightkeyproperty.site/property?id=harrow', {
    timeout: 30000,
    waitUntil: 'networkidle'
  });
  await page.waitForTimeout(3000);

  // Scroll to gallery
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(3000);

  const verification = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('video'));
    return {
      totalVideos: videos.length,
      videos: videos.map((v, i) => ({
        index: i + 1,
        src: v.src.split('/').pop(),
        poster: v.poster,
        hasPoster: !!v.poster,
        posterFile: v.poster ? v.poster.split('/').pop() : 'NONE',
        videoWidth: v.videoWidth,
        videoHeight: v.videoHeight,
        orientation: v.videoWidth > v.videoHeight ? 'LANDSCAPE' : 'PORTRAIT',
        readyState: v.readyState === 4 ? 'LOADED' : 'NOT_READY'
      }))
    };
  });

  console.log('PRODUCTION STATUS:\n');
  console.log(`Total Videos: ${verification.totalVideos}/3 ${verification.totalVideos === 3 ? '✅' : '❌'}\n`);

  verification.videos.forEach(v => {
    console.log(`Video ${v.index}:`);
    console.log(`  - File: ${v.src}`);
    console.log(`  - Poster: ${v.posterFile} ${v.hasPoster ? '✅' : '❌'}`);
    console.log(`  - Orientation: ${v.orientation} ${v.orientation === 'LANDSCAPE' ? '✅' : '❌'}`);
    console.log(`  - Status: ${v.readyState}`);
    console.log('');
  });

  const allPosters = verification.videos.every(v => v.hasPoster);
  const allLandscape = verification.videos.every(v => v.orientation === 'LANDSCAPE');

  console.log('=== FINAL RESULT ===');
  console.log(`Posters: ${allPosters ? '✅ ALL VIDEOS HAVE POSTERS' : '❌ Missing posters'}`);
  console.log(`Orientation: ${allLandscape ? '✅ ALL VIDEOS LANDSCAPE' : '❌ Wrong orientation'}`);
  console.log(`\n${allPosters && allLandscape ? '🎉 BLACK BOXES COMPLETELY FIXED!' : '⚠️  Issues remain'}`);

  await page.screenshot({ path: '/tmp/production-final-verification.png' });
  console.log('\nScreenshot: /tmp/production-final-verification.png');

  console.log('\nBrowser staying open for 20 seconds for manual inspection...');
  await page.waitForTimeout(20000);

  await browser.close();
})();
