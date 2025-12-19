const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('=== HOMEPAGE HERO VIDEO ===\n');
  await page.goto('http://localhost:8081/');
  await page.waitForTimeout(5000); // Wait for preloader

  const heroVideoInfo = await page.evaluate(() => {
    const video = document.getElementById('hero-video');
    if (!video) return { found: false };

    const rect = video.getBoundingClientRect();
    const styles = window.getComputedStyle(video);
    const parent = video.parentElement;
    const parentStyles = parent ? window.getComputedStyle(parent) : null;

    return {
      found: true,
      isVisible: rect.width > 0 && rect.height > 0,
      rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity,
      zIndex: styles.zIndex,
      position: styles.position,
      parentDisplay: parentStyles?.display,
      parentOpacity: parentStyles?.opacity,
      parentZIndex: parentStyles?.zIndex,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      currentTime: video.currentTime,
      duration: video.duration
    };
  });

  console.log('Hero Video Visibility:', JSON.stringify(heroVideoInfo, null, 2));

  // Check preloader
  const preloaderInfo = await page.evaluate(() => {
    const preloader = document.getElementById('intro-preloader');
    if (!preloader) return { found: false };

    const styles = window.getComputedStyle(preloader);
    return {
      found: true,
      display: styles.display,
      opacity: styles.opacity,
      visibility: styles.visibility,
      zIndex: styles.zIndex
    };
  });

  console.log('\nPreloader Info:', JSON.stringify(preloaderInfo, null, 2));

  await page.screenshot({ path: '/tmp/homepage-after-wait.png' });
  console.log('\nScreenshot: /tmp/homepage-after-wait.png');

  console.log('\n=== PROPERTY PAGE GALLERY VIDEOS ===\n');
  await page.goto('http://localhost:8081/property.html?id=harrow');
  await page.waitForTimeout(3000);

  // Scroll to gallery
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(1000);

  const galleryVideos = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('video'));
    return videos.map((video, index) => {
      const rect = video.getBoundingClientRect();
      const styles = window.getComputedStyle(video);
      const parent = video.parentElement;
      const parentStyles = parent ? window.getComputedStyle(parent) : null;

      return {
        index,
        src: video.src,
        isVisible: rect.width > 0 && rect.height > 0,
        rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        backgroundColor: styles.backgroundColor,
        objectFit: styles.objectFit,
        parentBackground: parentStyles?.backgroundColor,
        parentClasses: parent?.className,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        currentTime: video.currentTime,
        duration: video.duration,
        poster: video.poster
      };
    });
  });

  console.log('Gallery Videos:', JSON.stringify(galleryVideos, null, 2));

  await page.screenshot({ path: '/tmp/property-gallery-scrolled.png' });
  console.log('\nScreenshot: /tmp/property-gallery-scrolled.png');

  await browser.close();
})();
