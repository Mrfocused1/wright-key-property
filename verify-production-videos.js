const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Checking PRODUCTION video orientation...\n');

  try {
    await page.goto('https://www.wrightkeyproperty.site/property?id=harrow', {
      timeout: 30000,
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(5000);

    // Scroll to gallery
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(2000);

    const videoInfo = await page.evaluate(() => {
      const videos = Array.from(document.querySelectorAll('video'));
      return videos.map((v, i) => {
        // Try to get actual video dimensions
        const computedStyle = window.getComputedStyle(v);
        return {
          index: i + 1,
          src: v.currentSrc || v.src,
          videoWidth: v.videoWidth,
          videoHeight: v.videoHeight,
          orientation: v.videoWidth > v.videoHeight ? 'LANDSCAPE' : 'PORTRAIT',
          readyState: v.readyState,
          networkState: v.networkState,
          error: v.error ? v.error.message : null,
          computedWidth: computedStyle.width,
          computedHeight: computedStyle.height,
          currentTime: v.currentTime,
          duration: v.duration
        };
      });
    });

    console.log('PRODUCTION Video Details:');
    console.log(JSON.stringify(videoInfo, null, 2));

    // Take screenshot
    await page.screenshot({ path: '/tmp/production-videos-check.png' });
    console.log('\nScreenshot: /tmp/production-videos-check.png');

    // Check if videos have loaded
    const hasLandscape = videoInfo.some(v => v.orientation === 'LANDSCAPE');
    const hasPortrait = videoInfo.some(v => v.orientation === 'PORTRAIT');

    console.log('\n--- DIAGNOSIS ---');
    console.log(`Landscape videos detected: ${hasLandscape}`);
    console.log(`Portrait videos detected: ${hasPortrait}`);

    if (hasPortrait && !hasLandscape) {
      console.log('⚠️  ISSUE: Still serving OLD portrait videos - cache not cleared');
    } else if (hasLandscape) {
      console.log('✅ SUCCESS: New landscape videos are live!');
    } else {
      console.log('⚠️  Videos not loaded yet');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
})();
