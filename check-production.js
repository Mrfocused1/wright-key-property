const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Checking PRODUCTION site...\n');

  try {
    await page.goto('https://www.wrightkeyproperty.site/', { timeout: 30000 });
    await page.waitForTimeout(8000);

    const heroVideoInfo = await page.evaluate(() => {
      const video = document.getElementById('hero-video');
      if (!video) return { found: false };

      return {
        found: true,
        currentSrc: video.currentSrc,
        currentTime: video.currentTime,
        duration: video.duration,
        paused: video.paused,
        readyState: video.readyState,
        error: video.error ? video.error.message : null
      };
    });

    console.log('PRODUCTION Hero Video:', JSON.stringify(heroVideoInfo, null, 2));
    await page.screenshot({ path: '/tmp/production-homepage.png' });

    await page.goto('https://www.wrightkeyproperty.site/property?id=harrow', { timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(1000);

    const galleryInfo = await page.evaluate(() => {
      const videos = Array.from(document.querySelectorAll('video'));
      return videos.map(v => ({
        src: v.src,
        currentTime: v.currentTime,
        duration: v.duration,
        paused: v.paused,
        readyState: v.readyState,
        videoWidth: v.videoWidth,
        videoHeight: v.videoHeight
      }));
    });

    console.log('\nPRODUCTION Gallery Videos:', JSON.stringify(galleryInfo, null, 2));
    await page.screenshot({ path: '/tmp/production-gallery.png' });

    console.log('\nScreenshots saved:');
    console.log('- /tmp/production-homepage.png');
    console.log('- /tmp/production-gallery.png');
  } catch (error) {
    console.error('Error checking production:', error.message);
  }

  await browser.close();
})();
