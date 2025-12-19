const { chromium } = require('playwright');

(async () => {
    console.log('Starting Playwright test for drag slider...\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Navigate to investor page
        console.log('Navigating to investor page...');
        await page.goto('http://localhost:8000/investor.html', { waitUntil: 'networkidle' });

        // Wait for page to load
        await page.waitForTimeout(2000);

        // Scroll to transformation gallery
        console.log('Scrolling to transformation gallery...');
        await page.evaluate(() => {
            const gallery = document.querySelector('.comparison-slider');
            if (gallery) {
                gallery.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        await page.waitForTimeout(1000);

        // Get the first comparison slider
        const slider = await page.locator('.comparison-slider').first();
        const sliderBox = await slider.boundingBox();

        if (!sliderBox) {
            throw new Error('Slider not found or not visible');
        }

        console.log('Slider found at:', sliderBox);

        // Get initial position of after image
        const initialClip = await page.evaluate(() => {
            const container = document.querySelector('.after-image-container');
            return container ? container.style.clipPath : null;
        });
        console.log('Initial clip-path:', initialClip);

        // Test 1: Click/Tap test
        console.log('\n--- Test 1: Click at different positions ---');
        const leftX = sliderBox.x + sliderBox.width * 0.25;
        const centerY = sliderBox.y + sliderBox.height * 0.5;

        await page.mouse.click(leftX, centerY);
        await page.waitForTimeout(500);

        let clipAfterClick = await page.evaluate(() => {
            const container = document.querySelector('.after-image-container');
            return container ? container.style.clipPath : null;
        });
        console.log('Clip-path after click at 25%:', clipAfterClick);

        // Test 2: Drag test
        console.log('\n--- Test 2: Mouse drag test ---');
        const startX = sliderBox.x + sliderBox.width * 0.5;
        const endX = sliderBox.x + sliderBox.width * 0.75;

        console.log(`Dragging from (${startX}, ${centerY}) to (${endX}, ${centerY})`);

        await page.mouse.move(startX, centerY);
        await page.mouse.down();
        await page.waitForTimeout(100);

        // Move in small increments to simulate real drag
        const steps = 10;
        for (let i = 1; i <= steps; i++) {
            const x = startX + (endX - startX) * (i / steps);
            await page.mouse.move(x, centerY);
            await page.waitForTimeout(50);
        }

        await page.mouse.up();
        await page.waitForTimeout(500);

        let clipAfterDrag = await page.evaluate(() => {
            const container = document.querySelector('.after-image-container');
            return container ? container.style.clipPath : null;
        });
        console.log('Clip-path after drag to 75%:', clipAfterDrag);

        // Test 3: Check event listeners
        console.log('\n--- Test 3: Checking event listeners ---');
        const eventListeners = await page.evaluate(() => {
            const slider = document.querySelector('.comparison-slider');
            if (!slider) return 'Slider not found';

            // This won't show actual listeners but we can check attributes
            return {
                hasMouseDown: !!slider.onmousedown,
                hasMouseMove: !!slider.onmousemove,
                hasMouseUp: !!slider.onmouseup,
                hasTouchStart: !!slider.ontouchstart,
                hasTouchMove: !!slider.ontouchmove,
            };
        });
        console.log('Event listeners:', eventListeners);

        // Test 4: Manually trigger the updateSlider function
        console.log('\n--- Test 4: Testing slider logic manually ---');
        const manualTest = await page.evaluate(() => {
            const slider = document.querySelector('.comparison-slider');
            const afterContainer = slider.querySelector('.after-image-container');
            const handle = slider.querySelector('.slider-handle');
            const rect = slider.getBoundingClientRect();

            // Simulate position at 30%
            const position = 30;
            afterContainer.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
            handle.style.left = `${position}%`;

            return {
                clipPath: afterContainer.style.clipPath,
                handleLeft: handle.style.left,
                sliderWidth: rect.width
            };
        });
        console.log('Manual test result:', manualTest);

        console.log('\n✅ Test completed! Check the browser window.');
        console.log('Press Ctrl+C to exit when done inspecting...');

        // Keep browser open for inspection
        await page.waitForTimeout(60000);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
    }
})();
