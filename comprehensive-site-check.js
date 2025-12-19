const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('=== COMPREHENSIVE PRODUCTION SITE CHECK ===\n');

  // 1. CHECK HOMEPAGE HERO VIDEO
  console.log('1. Checking Homepage Hero Video...');
  await page.goto('https://www.wrightkeyproperty.site/', { timeout: 30000 });
  await page.waitForTimeout(8000); // Wait for preloader

  const heroVideoStatus = await page.evaluate(() => {
    const video = document.getElementById('hero-video');
    if (!video) return { found: false };

    return {
      found: true,
      src: video.currentSrc,
      isPlaying: !video.paused,
      currentTime: video.currentTime.toFixed(2),
      duration: video.duration.toFixed(2),
      videoSize: `${video.videoWidth}x${video.videoHeight}`
    };
  });

  console.log('Homepage Hero Video:', JSON.stringify(heroVideoStatus, null, 2));
  await page.screenshot({ path: '/tmp/check-homepage-hero.png', fullPage: false });
  console.log('Screenshot: /tmp/check-homepage-hero.png\n');

  // 2. CHECK PROPERTY PAGE GALLERY
  console.log('2. Checking Property Gallery Page...');
  await page.goto('https://www.wrightkeyproperty.site/property?id=harrow', { timeout: 30000 });
  await page.waitForTimeout(3000);

  // Scroll to gallery
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(2000);

  const galleryStatus = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img')).filter(img =>
      img.src.includes('/assets/properties/harrow/image-')
    );

    const videos = Array.from(document.querySelectorAll('video'));

    return {
      totalImages: images.length,
      totalVideos: videos.length,
      imageDetails: images.map(img => ({
        src: img.src.split('/').pop(),
        loaded: img.complete && img.naturalHeight > 0
      })),
      videoDetails: videos.map((v, i) => ({
        index: i + 1,
        src: v.src.split('/').pop(),
        orientation: v.videoWidth > v.videoHeight ? 'LANDSCAPE ✅' : 'PORTRAIT ❌',
        dimensions: `${v.videoWidth}x${v.videoHeight}`,
        readyState: v.readyState === 4 ? 'LOADED ✅' : `NOT READY (${v.readyState})`,
        hasError: v.error ? `ERROR: ${v.error.message}` : 'NO ERRORS ✅'
      }))
    };
  });

  console.log('Gallery Status:', JSON.stringify(galleryStatus, null, 2));
  await page.screenshot({ path: '/tmp/check-gallery-full.png', fullPage: false });
  console.log('Screenshot: /tmp/check-gallery-full.png\n');

  // 3. SUMMARY
  console.log('=== SUMMARY ===');
  console.log(`\nHomepage Hero Video: ${heroVideoStatus.found ? '✅ FOUND & PLAYING' : '❌ NOT FOUND'}`);
  if (heroVideoStatus.found) {
    console.log(`  - Video: ${heroVideoStatus.src.split('/').pop()}`);
    console.log(`  - Status: ${heroVideoStatus.isPlaying ? 'PLAYING ✅' : 'PAUSED'}`);
    console.log(`  - Size: ${heroVideoStatus.videoSize}`);
  }

  console.log(`\nGallery Content:`);
  console.log(`  - Images: ${galleryStatus.totalImages}/7 ${galleryStatus.totalImages === 7 ? '✅' : '❌'}`);
  console.log(`  - Videos: ${galleryStatus.totalVideos}/3 ${galleryStatus.totalVideos === 3 ? '✅' : '❌'}`);

  console.log(`\nVideo Orientations:`);
  galleryStatus.videoDetails.forEach(v => {
    console.log(`  - ${v.src}: ${v.orientation} (${v.dimensions})`);
  });

  const allLandscape = galleryStatus.videoDetails.every(v => v.orientation.includes('LANDSCAPE'));
  console.log(`\n${allLandscape ? '✅ ALL VIDEOS ARE LANDSCAPE - GREY BOXES FIXED!' : '⚠️  Some videos still portrait'}`);

  await browser.close();
})();
