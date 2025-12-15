const { chromium } = require('playwright');
const fs = require('fs');

async function checkBackgroundContrast() {
    console.log('🎨 Checking background image contrast and text visibility...\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const pages = [
        { name: 'Homepage', url: 'http://localhost:3000/index.html', hasHero: true },
        { name: 'Co-Living', url: 'http://localhost:3000/coliving.html', hasHero: true },
        { name: 'Browse', url: 'http://localhost:3000/search.html', hasHero: true },
        { name: 'Investor', url: 'http://localhost:3000/investor.html', hasHero: false },
        { name: 'Property Detail', url: 'http://localhost:3000/property.html?id=kensington', hasHero: true }
    ];

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();
    const findings = [];

    for (const testPage of pages) {
        console.log(`\n📄 Checking: ${testPage.name}`);
        console.log('─'.repeat(60));

        try {
            await page.goto(testPage.url, { waitUntil: 'networkidle' });

            // Wait for preloader to disappear
            try {
                await page.waitForSelector('.loader', { state: 'hidden', timeout: 5000 });
            } catch (e) {
                console.log('  ⚠️  Preloader still visible');
            }

            await page.waitForTimeout(1000);

            if (!testPage.hasHero) {
                console.log('  ℹ️  No hero section expected on this page');
                continue;
            }

            // Find the hero section
            const heroSection = await page.$('section');

            if (!heroSection) {
                console.log('  ❌ No hero section found');
                findings.push({
                    page: testPage.name,
                    severity: 'HIGH',
                    issue: 'No hero section found'
                });
                continue;
            }

            // Capture hero section screenshot
            const heroScreenshot = `screenshots/contrast-${testPage.name.toLowerCase().replace(/\s+/g, '-')}-hero.png`;
            await heroSection.screenshot({ path: heroScreenshot });
            console.log(`  📸 Hero captured: ${heroScreenshot}`);

            // Check for background image and overlay
            const heroAnalysis = await heroSection.evaluate(section => {
                const results = {
                    hasBackgroundImage: false,
                    hasOverlay: false,
                    textColor: null,
                    backgroundColor: null,
                    overlayDetails: [],
                    textElements: []
                };

                // Check for background image via CSS
                const sectionStyle = window.getComputedStyle(section);
                const bgImage = sectionStyle.backgroundImage;

                if (bgImage && bgImage !== 'none') {
                    results.hasBackgroundImage = true;
                }

                // Check for img tags
                const imgTags = section.querySelectorAll('img');
                if (imgTags.length > 0) {
                    results.hasBackgroundImage = true;
                }

                // Check for overlay elements (common patterns)
                const overlaySelectors = [
                    '.hero-video-overlay',
                    '.reveal-overlay',
                    '[class*="overlay"]',
                    '[class*="gradient"]'
                ];

                overlaySelectors.forEach(selector => {
                    const overlays = section.querySelectorAll(selector);
                    overlays.forEach(overlay => {
                        const overlayStyle = window.getComputedStyle(overlay);
                        const bg = overlayStyle.backgroundColor;
                        const bgImage = overlayStyle.backgroundImage;
                        const opacity = overlayStyle.opacity;

                        if (bg !== 'rgba(0, 0, 0, 0)' || bgImage !== 'none') {
                            results.hasOverlay = true;
                            results.overlayDetails.push({
                                selector: selector,
                                backgroundColor: bg,
                                backgroundImage: bgImage,
                                opacity: opacity
                            });
                        }
                    });
                });

                // Check text elements and their colors
                const textElements = section.querySelectorAll('h1, h2, h3, p, span, a');
                textElements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const color = style.color;
                    const rect = el.getBoundingClientRect();

                    // Only check visible text
                    if (rect.width > 0 && rect.height > 0 && el.textContent.trim().length > 0) {
                        results.textElements.push({
                            tag: el.tagName.toLowerCase(),
                            color: color,
                            text: el.textContent.trim().substring(0, 50)
                        });
                    }
                });

                results.backgroundColor = sectionStyle.backgroundColor;

                return results;
            });

            // Analyze results
            console.log(`\n  📊 Analysis:`);
            console.log(`     Background Image: ${heroAnalysis.hasBackgroundImage ? '✓ Yes' : '✗ No'}`);
            console.log(`     Overlay/Tint: ${heroAnalysis.hasOverlay ? '✓ Yes' : '✗ No'}`);

            if (heroAnalysis.overlayDetails.length > 0) {
                console.log(`     Overlay Details:`);
                heroAnalysis.overlayDetails.forEach((overlay, i) => {
                    console.log(`       ${i + 1}. ${overlay.selector}`);
                    console.log(`          - Background: ${overlay.backgroundColor}`);
                    console.log(`          - Opacity: ${overlay.opacity}`);
                });
            }

            // Check text visibility
            const lightTextColors = heroAnalysis.textElements.filter(el => {
                // Parse RGB values
                const match = el.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (match) {
                    const r = parseInt(match[1]);
                    const g = parseInt(match[2]);
                    const b = parseInt(match[3]);
                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                    return brightness > 128; // Light text (above middle gray)
                }
                return false;
            });

            const darkTextColors = heroAnalysis.textElements.filter(el => {
                const match = el.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (match) {
                    const r = parseInt(match[1]);
                    const g = parseInt(match[2]);
                    const b = parseInt(match[3]);
                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                    return brightness <= 128; // Dark text
                }
                return false;
            });

            console.log(`     Text Colors:`);
            console.log(`       - Light text elements: ${lightTextColors.length}`);
            console.log(`       - Dark text elements: ${darkTextColors.length}`);

            // Determine issues
            if (heroAnalysis.hasBackgroundImage && lightTextColors.length > 0 && !heroAnalysis.hasOverlay) {
                const issue = 'Light text on background image without overlay/tint - may have poor visibility';
                console.log(`  ⚠️  ${issue}`);
                findings.push({
                    page: testPage.name,
                    severity: 'HIGH',
                    issue: issue,
                    recommendation: 'Add dark overlay (e.g., bg-gradient-to-b from-black/60 to-black/70) to hero section'
                });
            } else if (heroAnalysis.hasBackgroundImage && lightTextColors.length > 0 && heroAnalysis.hasOverlay) {
                console.log(`  ✓ Light text with overlay - good visibility`);
            } else if (heroAnalysis.hasBackgroundImage && darkTextColors.length > 0 && !heroAnalysis.hasOverlay) {
                const issue = 'Dark text on background image without overlay - may have poor visibility';
                console.log(`  ⚠️  ${issue}`);
                findings.push({
                    page: testPage.name,
                    severity: 'MEDIUM',
                    issue: issue,
                    recommendation: 'Add light overlay or use darker background image'
                });
            } else {
                console.log(`  ✓ No contrast issues detected`);
            }

        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            findings.push({
                page: testPage.name,
                severity: 'CRITICAL',
                issue: `Error analyzing page: ${error.message}`
            });
        }
    }

    await browser.close();

    // Generate report
    console.log('\n\n' + '═'.repeat(60));
    console.log('📊 BACKGROUND CONTRAST REPORT');
    console.log('═'.repeat(60));

    const criticalIssues = findings.filter(f => f.severity === 'CRITICAL');
    const highIssues = findings.filter(f => f.severity === 'HIGH');
    const mediumIssues = findings.filter(f => f.severity === 'MEDIUM');

    console.log(`\n🔴 CRITICAL: ${criticalIssues.length} issues`);
    criticalIssues.forEach(f => {
        console.log(`   • [${f.page}] ${f.issue}`);
    });

    console.log(`\n🟠 HIGH: ${highIssues.length} issues`);
    highIssues.forEach(f => {
        console.log(`   • [${f.page}] ${f.issue}`);
        if (f.recommendation) {
            console.log(`     → ${f.recommendation}`);
        }
    });

    console.log(`\n🟡 MEDIUM: ${mediumIssues.length} issues`);
    mediumIssues.forEach(f => {
        console.log(`   • [${f.page}] ${f.issue}`);
        if (f.recommendation) {
            console.log(`     → ${f.recommendation}`);
        }
    });

    if (findings.length === 0) {
        console.log('\n✅ All pages have proper contrast! No issues found.');
    } else {
        console.log(`\n\nTotal issues found: ${findings.length}`);
    }

    // Write report to file
    const reportContent = `# Background Contrast Report
Generated: ${new Date().toISOString()}

## Summary
- **Total Issues**: ${findings.length}
- **Critical**: ${criticalIssues.length}
- **High**: ${highIssues.length}
- **Medium**: ${mediumIssues.length}

## Findings

### 🔴 CRITICAL ISSUES (${criticalIssues.length})
${criticalIssues.map(f => `- **[${f.page}]** ${f.issue}`).join('\n') || 'None'}

### 🟠 HIGH PRIORITY ISSUES (${highIssues.length})
${highIssues.map(f => `- **[${f.page}]** ${f.issue}\n  - **Fix:** ${f.recommendation || 'See screenshots'}`).join('\n\n') || 'None'}

### 🟡 MEDIUM PRIORITY ISSUES (${mediumIssues.length})
${mediumIssues.map(f => `- **[${f.page}]** ${f.issue}\n  - **Fix:** ${f.recommendation || 'See screenshots'}`).join('\n\n') || 'None'}

## Recommendations
1. All hero sections with background images and light text should have dark overlays
2. Use gradient overlays (e.g., \`bg-gradient-to-b from-black/60 via-black/50 to-black/70\`)
3. Ensure WCAG AA contrast ratio of at least 4.5:1 for normal text, 3:1 for large text
4. Test on multiple devices and lighting conditions

## Screenshots
All contrast check screenshots saved to: \`screenshots/contrast-*.png\`
`;

    fs.writeFileSync('CONTRAST_REPORT.md', reportContent);
    console.log('\n📄 Detailed report saved to: CONTRAST_REPORT.md');
    console.log('\n✅ Contrast check complete!');
}

checkBackgroundContrast().catch(console.error);
