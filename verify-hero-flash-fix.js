const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('=== VERIFYING HERO IMAGE FLASH FIX ON PRODUCTION ===\n');

  const imageChanges = [];

  // Monitor all image src changes on the page
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('hero-image.jpg') || url.includes('unsplash.com')) {
      imageChanges.push({
        time: Date.now(),
        url: url,
        type: 'NETWORK_REQUEST'
      });
    }
  });

  await page.goto('https://www.wrightkeyproperty.site/property?id=harrow', {
    timeout: 30000,
    waitUntil: 'domcontentloaded'
  });

  // Check initial hero image src
  const initialSrc = await page.evaluate(() => {
    const img = document.getElementById('hero-image');
    return img ? img.src : null;
  });

  console.log('Initial hero image src:', initialSrc);
  console.log('Expected: /assets/properties/harrow/hero-image.jpg');

  const isCorrect = initialSrc && initialSrc.includes('/assets/properties/harrow/hero-image.jpg');
  const noUnsplash = !initialSrc || !initialSrc.includes('unsplash.com');

  console.log('\n=== RESULTS ===');
  console.log(`✅ Correct image loaded: ${isCorrect ? 'YES' : 'NO'}`);
  console.log(`✅ No Unsplash placeholder: ${noUnsplash ? 'YES' : 'NO'}`);

  // Wait for any JS updates
  await page.waitForTimeout(3000);

  const finalSrc = await page.evaluate(() => {
    const img = document.getElementById('hero-image');
    return img ? img.src : null;
  });

  const noChange = initialSrc === finalSrc;
  console.log(`✅ Image src unchanged (no flash): ${noChange ? 'YES' : 'NO'}`);

  if (isCorrect && noUnsplash && noChange) {
    console.log('\n🎉 HERO IMAGE FLASH COMPLETELY FIXED!');
  } else {
    console.log('\n⚠️  Issues detected - needs investigation');
  }

  await page.screenshot({ path: '/tmp/hero-flash-verification.png' });
  console.log('\nScreenshot: /tmp/hero-flash-verification.png');

  console.log('\nBrowser staying open for 10 seconds...');
  await page.waitForTimeout(10000);

  await browser.close();
})();
