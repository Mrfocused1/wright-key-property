const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function takeScreenshots() {
    console.log('Starting Playwright screenshot capture...\n');

    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Launch browser
    const browser = await chromium.launch({
        headless: true
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    try {
        // Navigate to the co-living page
        console.log('Navigating to localhost:3000/coliving.html...');
        await page.goto('http://localhost:3000/coliving.html', {
            waitUntil: 'networkidle'
        });

        // Wait for animations to complete
        await page.waitForTimeout(3000);

        console.log('✓ Page loaded\n');

        // 1. Full page screenshot
        console.log('Taking full page screenshot...');
        await page.screenshot({
            path: path.join(screenshotsDir, '01-full-page.png'),
            fullPage: true
        });
        console.log('✓ Saved: 01-full-page.png');

        // 2. Hero section
        console.log('Taking hero section screenshot...');
        await page.screenshot({
            path: path.join(screenshotsDir, '02-hero-section.png'),
            clip: { x: 0, y: 0, width: 1920, height: 1080 }
        });
        console.log('✓ Saved: 02-hero-section.png');

        // 3. Scroll to "Our Community" section
        console.log('Scrolling to Our Community section...');
        const communitySection = await page.locator('section:has-text("Who We Serve")').first();
        await communitySection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);

        // 4. Community section full view
        console.log('Taking community section screenshot...');
        await page.screenshot({
            path: path.join(screenshotsDir, '03-community-section-full.png'),
            clip: { x: 0, y: 0, width: 1920, height: 1080 }
        });
        console.log('✓ Saved: 03-community-section-full.png');

        // 5. Individual community cards - Desktop view
        console.log('Taking individual card screenshots...');

        // Scroll to show all cards properly
        await page.evaluate(() => window.scrollBy(0, -200));
        await page.waitForTimeout(500);

        const cards = await page.locator('.community-card').all();

        for (let i = 0; i < cards.length; i++) {
            console.log(`  Card ${i + 1}...`);
            await cards[i].scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);

            const boundingBox = await cards[i].boundingBox();
            if (boundingBox) {
                await page.screenshot({
                    path: path.join(screenshotsDir, `04-card-${i + 1}-desktop.png`),
                    clip: {
                        x: Math.max(0, boundingBox.x - 20),
                        y: Math.max(0, boundingBox.y - 20),
                        width: Math.min(boundingBox.width + 40, 1920),
                        height: boundingBox.height + 40
                    }
                });
                console.log(`  ✓ Saved: 04-card-${i + 1}-desktop.png`);
            }
        }

        // 6. Hover state on first card
        console.log('Capturing hover state on first card...');
        await page.locator('.community-card').first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await page.locator('.community-card').first().hover();
        await page.waitForTimeout(500);

        await page.screenshot({
            path: path.join(screenshotsDir, '05-card-hover-state.png'),
            clip: { x: 0, y: 0, width: 1920, height: 1080 }
        });
        console.log('✓ Saved: 05-card-hover-state.png');

        // 7. Mobile view
        console.log('\nSwitching to mobile viewport...');
        await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
        await page.goto('http://localhost:3000/coliving.html', {
            waitUntil: 'networkidle'
        });
        await page.waitForTimeout(2000);

        // Scroll to community section on mobile
        await page.locator('section:has-text("Who We Serve")').first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);

        console.log('Taking mobile screenshots...');
        await page.screenshot({
            path: path.join(screenshotsDir, '06-mobile-community-section.png'),
            fullPage: true
        });
        console.log('✓ Saved: 06-mobile-community-section.png');

        // 8. Tablet view
        console.log('\nSwitching to tablet viewport...');
        await page.setViewportSize({ width: 768, height: 1024 }); // iPad
        await page.goto('http://localhost:3000/coliving.html', {
            waitUntil: 'networkidle'
        });
        await page.waitForTimeout(2000);

        await page.locator('section:has-text("Who We Serve")').first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);

        console.log('Taking tablet screenshots...');
        await page.screenshot({
            path: path.join(screenshotsDir, '07-tablet-community-section.png'),
            clip: { x: 0, y: 0, width: 768, height: 1024 }
        });
        console.log('✓ Saved: 07-tablet-community-section.png');

        console.log('\n✓ All screenshots captured successfully!');
        console.log(`\nScreenshots saved to: ${screenshotsDir}`);

    } catch (error) {
        console.error('Error taking screenshots:', error);
    } finally {
        await browser.close();
        console.log('\n✓ Browser closed');
    }
}

takeScreenshots().catch(console.error);
