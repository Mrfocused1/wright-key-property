const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Testing hero image flash fix...\n');

  // Track image changes
  const imageChanges = [];

  await page.exposeFunction('logImageChange', (src) => {
    imageChanges.push({ time: Date.now(), src });
  });

  // Monitor image src changes
  await page.evaluateOnNewDocument(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          const img = mutation.target;
          if (img.id === 'hero-image') {
            window.logImageChange(img.src);
          }
        }
      });
    });

    document.addEventListener('DOMContentLoaded', () => {
      const heroImg = document.getElementById('hero-image');
      if (heroImg) {
        window.logImageChange('INITIAL: ' + heroImg.src);
        observer.observe(heroImg, { attributes: true });
      }
    });
  });

  await page.goto('http://localhost:8081/property.html?id=harrow', {
    timeout: 30000,
    waitUntil: 'domcontentloaded'
  });

  // Wait a bit for any JS changes
  await page.waitForTimeout(2000);

  const finalSrc = await page.evaluate(() => {
    const img = document.getElementById('hero-image');
    return img ? img.src : null;
  });

  console.log('Image Load Sequence:');
  imageChanges.forEach((change, i) => {
    console.log(`${i + 1}. ${change.src}`);
  });

  console.log(`\nFinal image: ${finalSrc}`);

  const hasFlash = imageChanges.length > 1;
  console.log(`\n${hasFlash ? '❌ FLASH DETECTED - Image changed ' + imageChanges.length + ' times' : '✅ NO FLASH - Image loaded correctly from start'}`);

  await page.screenshot({ path: '/tmp/test-hero-flash-fix.png' });
  console.log('\nScreenshot: /tmp/test-hero-flash-fix.png');

  console.log('\nBrowser staying open for 10 seconds...');
  await page.waitForTimeout(10000);

  await browser.close();
})();
