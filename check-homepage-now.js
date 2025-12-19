const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Checking HOMEPAGE HERO VIDEO NOW...\n');

  await page.goto('https://www.wrightkeyproperty.site/', { timeout: 30000 });
  await page.waitForTimeout(8000); // Wait for preloader

  const heroStatus = await page.evaluate(() => {
    const video = document.getElementById('hero-video');
    if (!video) return { found: false };

    return {
      found: true,
      src: video.currentSrc,
      isPlaying: !video.paused,
      currentTime: video.currentTime.toFixed(2),
      duration: video.duration.toFixed(2),
      videoSize: `${video.videoWidth}x${video.videoHeight}`,
      readyState: video.readyState,
      hasError: video.error ? video.error.message : null
    };
  });

  console.log('Homepage Hero Video:', JSON.stringify(heroStatus, null, 2));

  if (heroStatus.isPlaying) {
    console.log('\n✅ HERO VIDEO IS PLAYING!');
  } else {
    console.log('\n❌ Hero video is NOT playing');
  }

  await page.screenshot({ path: '/tmp/homepage-hero-now.png' });
  console.log('\nScreenshot: /tmp/homepage-hero-now.png');

  console.log('\nBrowser staying open for 10 seconds...');
  await page.waitForTimeout(10000);

  await browser.close();
})();
