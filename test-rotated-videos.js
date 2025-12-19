const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Testing rotated videos...\n');
  await page.goto('http://localhost:8081/property.html?id=harrow');
  await page.waitForTimeout(3000);

  // Scroll to gallery
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(1000);

  const videoInfo = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('video'));
    return videos.map((v, i) => ({
      index: i + 1,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
      orientation: v.videoWidth > v.videoHeight ? 'LANDSCAPE' : 'PORTRAIT'
    }));
  });

  console.log('Video Orientations:', JSON.stringify(videoInfo, null, 2));

  await page.screenshot({ path: '/tmp/rotated-videos-test.png' });
  console.log('\nScreenshot saved: /tmp/rotated-videos-test.png');

  await browser.close();
})();
