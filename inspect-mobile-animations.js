const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function inspectMobileAnimations() {
    console.log('🔍 Starting mobile animation inspection...');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 300
    });

    // Mobile viewport (iPhone X)
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true
    });

    const page = await context.newPage();

    const screenshotsDir = path.join(__dirname, 'screenshots', 'mobile-debug');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    try {
        console.log('📱 Loading co-living page on mobile...');
        await page.goto('http://localhost:3000/coliving.html', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Wait for preloader to disappear
        console.log('⏳ Waiting for preloader to complete...');
        await page.waitForSelector('.loader', { state: 'hidden', timeout: 5000 }).catch(() => {
            console.log('⚠️  Preloader timeout - continuing anyway');
        });
        await page.waitForTimeout(500);

        // 1. Initial page load
        console.log('📸 Capturing initial load...');
        await page.screenshot({
            path: path.join(screenshotsDir, '01-initial-load.png'),
            fullPage: false
        });

        // 2. Hero section
        console.log('📸 Capturing hero section...');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        await page.screenshot({
            path: path.join(screenshotsDir, '02-hero-mobile.png'),
            fullPage: false
        });

        // 3. Scroll to community section
        console.log('📸 Scrolling to community cards...');
        await page.evaluate(() => {
            const section = document.querySelector('#community');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
        await page.waitForTimeout(2000); // Wait for scroll animation

        await page.screenshot({
            path: path.join(screenshotsDir, '03-community-after-scroll.png'),
            fullPage: false
        });

        // 4. Check if cards are visible
        console.log('🔍 Checking card visibility...');
        const cardVisibility = await page.evaluate(() => {
            const cards = document.querySelectorAll('.community-card');
            return Array.from(cards).map((card, index) => {
                const rect = card.getBoundingClientRect();
                const styles = window.getComputedStyle(card);
                return {
                    index,
                    visible: rect.width > 0 && rect.height > 0,
                    opacity: styles.opacity,
                    transform: styles.transform,
                    display: styles.display,
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                };
            });
        });

        console.log('Card visibility data:', JSON.stringify(cardVisibility, null, 2));

        // 5. Scroll to featured spaces
        console.log('📸 Scrolling to featured spaces...');
        await page.evaluate(() => {
            const section = document.querySelector('#featured-spaces');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: path.join(screenshotsDir, '04-featured-spaces.png'),
            fullPage: false
        });

        // 6. Full page screenshot
        console.log('📸 Capturing full mobile page...');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        await page.screenshot({
            path: path.join(screenshotsDir, '05-full-page-mobile.png'),
            fullPage: true
        });

        // 7. Check for console errors
        console.log('🔍 Checking for JavaScript errors...');
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Console Error:', msg.text());
            }
        });

        // 8. Check GSAP animations
        const gsapInfo = await page.evaluate(() => {
            return {
                gsapLoaded: typeof gsap !== 'undefined',
                scrollTriggerLoaded: typeof ScrollTrigger !== 'undefined',
                animations: gsap ? gsap.globalTimeline.getChildren().length : 0
            };
        });

        console.log('GSAP Info:', gsapInfo);

        console.log('✅ Mobile inspection complete!');
        console.log(`📁 Screenshots saved to: ${screenshotsDir}`);

        // Keep browser open for 5 seconds to observe
        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('❌ Error during inspection:', error);
    } finally {
        await browser.close();
        console.log('🔚 Browser closed.');
    }
}

inspectMobileAnimations();
