const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const pages = [
    { name: 'Homepage', url: 'http://localhost:8081/' },
    { name: 'Property Page', url: 'http://localhost:8081/property?id=harrow' },
    { name: 'Investor Page', url: 'http://localhost:8081/investor' },
    { name: 'Co-Living Page', url: 'http://localhost:8081/coliving' },
    { name: 'Search Page', url: 'http://localhost:8081/search' }
  ];

  console.log('=== TESTING LOGOS ACROSS ALL PAGES ===\n');

  for (const pageInfo of pages) {
    const page = await context.newPage();

    try {
      await page.goto(pageInfo.url, { timeout: 30000, waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Check header logo
      const headerLogo = await page.evaluate(() => {
        const nav = document.querySelector('nav');
        const img = nav?.querySelector('img');
        return {
          found: !!img,
          src: img?.src || null,
          alt: img?.alt || null,
          height: img?.height || null,
          visible: img ? window.getComputedStyle(img).display !== 'none' : false
        };
      });

      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      // Check footer logo
      const footerLogo = await page.evaluate(() => {
        const footer = document.querySelector('footer');
        const img = footer?.querySelector('img');
        return {
          found: !!img,
          src: img?.src || null,
          alt: img?.alt || null,
          height: img?.height || null,
          visible: img ? window.getComputedStyle(img).display !== 'none' : false
        };
      });

      console.log(`\n${pageInfo.name}:`);
      console.log(`  Header Logo: ${headerLogo.found ? '✅' : '❌'}`);
      if (headerLogo.found) {
        console.log(`    - Src: ${headerLogo.src.split('/').slice(-2).join('/')}`);
        console.log(`    - Visible: ${headerLogo.visible ? '✅' : '❌'}`);
      }

      console.log(`  Footer Logo: ${footerLogo.found ? '✅' : '❌'}`);
      if (footerLogo.found) {
        console.log(`    - Src: ${footerLogo.src.split('/').slice(-2).join('/')}`);
        console.log(`    - Visible: ${footerLogo.visible ? '✅' : '❌'}`);
      }

      // Take screenshot
      await page.screenshot({
        path: `/tmp/logo-test-${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: false
      });

    } catch (error) {
      console.log(`\n${pageInfo.name}: ❌ ERROR - ${error.message}`);
    }

    await page.close();
  }

  console.log('\n\n=== SUMMARY ===');
  console.log('All logos should be using "light version logo.png"');
  console.log('Screenshots saved to /tmp/logo-test-*.png');

  console.log('\nBrowser staying open for 5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  await browser.close();
})();
