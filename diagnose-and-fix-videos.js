const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Show browser
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('=== STEP 1: Navigate to Property Page ===');
  await page.goto('https://www.wrightkeyproperty.site/property?id=harrow', {
    timeout: 30000,
    waitUntil: 'networkidle'
  });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: '/tmp/step1-page-load.png' });
  console.log('Screenshot: /tmp/step1-page-load.png\n');

  console.log('=== STEP 2: Scroll to Gallery ===');
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(2000);

  await page.screenshot({ path: '/tmp/step2-gallery-view.png' });
  console.log('Screenshot: /tmp/step2-gallery-view.png\n');

  console.log('=== STEP 3: Check Video Elements ===');
  const videoCheck = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('video'));
    return videos.map((v, i) => {
      const rect = v.getBoundingClientRect();
      const styles = window.getComputedStyle(v);

      return {
        index: i + 1,
        src: v.src,
        poster: v.poster,
        hasPoster: !!v.poster,
        videoWidth: v.videoWidth,
        videoHeight: v.videoHeight,
        displayWidth: rect.width,
        displayHeight: rect.height,
        readyState: v.readyState,
        currentTime: v.currentTime,
        backgroundColor: styles.backgroundColor,
        objectFit: styles.objectFit
      };
    });
  });

  console.log('Video Elements:', JSON.stringify(videoCheck, null, 2));

  // Check if videos need poster images
  const needsPosters = videoCheck.some(v => !v.hasPoster);
  console.log(`\nVideos need poster frames: ${needsPosters ? 'YES ⚠️' : 'NO ✅'}`);

  console.log('\n=== STEP 4: Highlight Video Elements ===');
  await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('video'));
    videos.forEach((v, i) => {
      v.style.border = '5px solid red';
      v.style.outline = '5px solid yellow';

      // Add label
      const label = document.createElement('div');
      label.textContent = `VIDEO ${i + 1}`;
      label.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        background: red;
        color: white;
        padding: 10px;
        font-size: 20px;
        font-weight: bold;
        z-index: 9999;
      `;
      v.parentElement.style.position = 'relative';
      v.parentElement.appendChild(label);
    });
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/step4-videos-highlighted.png' });
  console.log('Screenshot: /tmp/step4-videos-highlighted.png\n');

  console.log('=== STEP 5: Try to Play Videos ===');
  const playResults = await page.evaluate(async () => {
    const videos = Array.from(document.querySelectorAll('video'));
    const results = [];

    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      try {
        await v.play();
        await new Promise(r => setTimeout(r, 500));
        results.push({
          index: i + 1,
          played: true,
          currentTime: v.currentTime,
          paused: v.paused
        });
        v.pause();
      } catch (error) {
        results.push({
          index: i + 1,
          played: false,
          error: error.message
        });
      }
    }
    return results;
  });

  console.log('Play Test Results:', JSON.stringify(playResults, null, 2));

  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/step5-after-play-test.png' });
  console.log('Screenshot: /tmp/step5-after-play-test.png\n');

  console.log('\n=== DIAGNOSIS COMPLETE ===');
  console.log('Check screenshots in /tmp/ folder');

  console.log('\nKeeping browser open for 30 seconds for manual inspection...');
  await page.waitForTimeout(30000);

  await browser.close();
})();
