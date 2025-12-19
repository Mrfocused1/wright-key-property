const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Testing Homepage Hero Video...');
  await page.goto('http://localhost:8081/');
  await page.waitForTimeout(3000);

  // Check hero video
  const heroVideo = await page.$('#hero-video');
  if (heroVideo) {
    const videoSrc = await heroVideo.getAttribute('src');
    const currentSrc = await page.evaluate(() => {
      const vid = document.getElementById('hero-video');
      return vid ? vid.currentSrc : null;
    });
    const isPaused = await page.evaluate(() => {
      const vid = document.getElementById('hero-video');
      return vid ? vid.paused : null;
    });
    const readyState = await page.evaluate(() => {
      const vid = document.getElementById('hero-video');
      return vid ? vid.readyState : null;
    });
    const networkState = await page.evaluate(() => {
      const vid = document.getElementById('hero-video');
      return vid ? vid.networkState : null;
    });
    const error = await page.evaluate(() => {
      const vid = document.getElementById('hero-video');
      return vid && vid.error ? vid.error.message : null;
    });

    console.log('Hero Video Info:');
    console.log('- Source attribute:', videoSrc);
    console.log('- Current source:', currentSrc);
    console.log('- Is paused:', isPaused);
    console.log('- Ready state:', readyState, '(4=HAVE_ENOUGH_DATA)');
    console.log('- Network state:', networkState, '(2=NETWORK_LOADING, 3=NETWORK_NO_SOURCE)');
    console.log('- Error:', error);
  } else {
    console.log('Hero video element not found!');
  }

  await page.screenshot({ path: '/tmp/homepage-hero.png', fullPage: false });
  console.log('Screenshot saved: /tmp/homepage-hero.png');

  console.log('\n---\n');
  console.log('Testing Property Page Gallery Videos...');
  await page.goto('http://localhost:8081/property.html?id=harrow');
  await page.waitForTimeout(3000);

  // Scroll to gallery
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(1000);

  const videos = await page.$$('video');
  console.log(`Found ${videos.length} video elements on property page`);

  for (let i = 0; i < videos.length; i++) {
    const src = await videos[i].getAttribute('src');
    const paused = await page.evaluate((el) => el.paused, videos[i]);
    const readyState = await page.evaluate((el) => el.readyState, videos[i]);
    const error = await page.evaluate((el) => el.error ? el.error.message : null, videos[i]);

    console.log(`\nVideo ${i + 1}:`);
    console.log('- Source:', src);
    console.log('- Is paused:', paused);
    console.log('- Ready state:', readyState);
    console.log('- Error:', error);
  }

  await page.screenshot({ path: '/tmp/property-gallery.png', fullPage: false });
  console.log('\nScreenshot saved: /tmp/property-gallery.png');

  // Check console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });

  await browser.close();
})();
