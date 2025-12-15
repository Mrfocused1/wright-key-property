const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function analyzePage() {
    console.log('🚀 Starting comprehensive page analysis...');

    const browser = await chromium.launch({
        headless: true
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(__dirname, 'screenshots', 'full-analysis');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    try {
        console.log('📄 Loading coliving.html page...');
        await page.goto('http://localhost:3000/coliving.html', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Wait for GSAP animations to complete
        await page.waitForTimeout(3000);

        // 1. HERO SECTION - Above fold
        console.log('📸 Capturing hero section (above fold)...');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        await page.screenshot({
            path: path.join(screenshotsDir, '01-hero-above-fold.png'),
            clip: { x: 0, y: 0, width: 1920, height: 1080 }
        });

        // 2. FULL PAGE SCREENSHOT - Desktop
        console.log('📸 Capturing full page - Desktop (1920x1080)...');
        await page.screenshot({
            path: path.join(screenshotsDir, '02-full-page-desktop.png'),
            fullPage: true
        });

        // 3. OUR COMMUNITY SECTION - Scroll to it
        console.log('📸 Capturing Our Community section...');
        await page.evaluate(() => {
            const section = document.querySelector('section h2');
            if (section && section.textContent.includes('Who We Serve')) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        await page.waitForTimeout(1500);
        await page.screenshot({
            path: path.join(screenshotsDir, '03-community-section.png'),
            clip: { x: 0, y: 0, width: 1920, height: 1080 }
        });

        // 4. FEATURED SPACES SECTION
        console.log('📸 Capturing Featured Spaces section...');
        await page.evaluate(() => {
            const headers = Array.from(document.querySelectorAll('h2'));
            const featuredHeader = headers.find(h => h.textContent.includes('Featured Spaces'));
            if (featuredHeader) {
                featuredHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        await page.waitForTimeout(1500);
        await page.screenshot({
            path: path.join(screenshotsDir, '04-featured-spaces.png'),
            clip: { x: 0, y: 0, width: 1920, height: 1400 }
        });

        // 5. HEADER/NAVIGATION - Back to top
        console.log('📸 Capturing header navigation...');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        await page.screenshot({
            path: path.join(screenshotsDir, '05-header-nav.png'),
            clip: { x: 0, y: 0, width: 1920, height: 100 }
        });

        // 6. CTA SECTION - Scroll to bottom
        console.log('📸 Capturing CTA section...');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        await page.screenshot({
            path: path.join(screenshotsDir, '06-cta-section.png'),
            clip: { x: 0, y: 0, width: 1920, height: 1080 }
        });

        // 7. MOBILE VIEW - 375px (iPhone X)
        console.log('📱 Switching to mobile viewport (375x812)...');
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(1000);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        await page.screenshot({
            path: path.join(screenshotsDir, '07-mobile-hero.png'),
            clip: { x: 0, y: 0, width: 375, height: 812 }
        });

        await page.screenshot({
            path: path.join(screenshotsDir, '08-mobile-full-page.png'),
            fullPage: true
        });

        // 9. TABLET VIEW - 768px (iPad)
        console.log('📱 Switching to tablet viewport (768x1024)...');
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1000);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        await page.screenshot({
            path: path.join(screenshotsDir, '09-tablet-full-page.png'),
            fullPage: true
        });

        console.log('✅ All screenshots captured successfully!');
        console.log(`📁 Saved to: ${screenshotsDir}`);

    } catch (error) {
        console.error('❌ Error during analysis:', error);
    } finally {
        await browser.close();
        console.log('🔚 Browser closed. Analysis complete.');
    }
}

analyzePage();
