const { chromium } = require('playwright');
const fs = require('fs');

async function designAudit() {
    console.log('🎨 Starting comprehensive design audit...\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const pages = [
        { name: 'Homepage', url: 'http://localhost:3000/index.html' },
        { name: 'Co-Living', url: 'http://localhost:3000/coliving.html' },
        { name: 'Browse', url: 'http://localhost:3000/search.html' },
        { name: 'Investor', url: 'http://localhost:3000/investor.html' },
        { name: 'Property Detail', url: 'http://localhost:3000/property.html?id=kensington' }
    ];

    const viewports = [
        { name: 'mobile', width: 375, height: 812 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1920, height: 1080 }
    ];

    const findings = [];

    for (const viewport of viewports) {
        console.log(`\n📱 Testing ${viewport.name.toUpperCase()} viewport (${viewport.width}x${viewport.height})`);
        console.log('═'.repeat(60));

        const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
            deviceScaleFactor: viewport.name === 'mobile' ? 2 : 1
        });

        const page = await context.newPage();

        for (const testPage of pages) {
            console.log(`\n  ➤ Auditing: ${testPage.name}`);

            try {
                await page.goto(testPage.url, { waitUntil: 'networkidle' });

                // Wait for preloader to disappear
                try {
                    await page.waitForSelector('.loader', { state: 'hidden', timeout: 5000 });
                } catch (e) {
                    console.log('    ⚠️  Preloader timeout - may still be visible');
                    findings.push({
                        page: testPage.name,
                        viewport: viewport.name,
                        severity: 'HIGH',
                        issue: 'Preloader did not disappear within 5 seconds'
                    });
                }

                await page.waitForTimeout(1000);

                // Capture hero section
                const heroScreenshot = `screenshots/${viewport.name}-${testPage.name.toLowerCase().replace(/\s+/g, '-')}-hero.png`;
                await page.screenshot({
                    path: heroScreenshot,
                    fullPage: false
                });
                console.log(`    📸 Hero captured: ${heroScreenshot}`);

                // Check for hero background image
                const heroSection = await page.$('section');
                if (heroSection) {
                    const heroStyles = await heroSection.evaluate(el => {
                        const computedStyle = window.getComputedStyle(el);
                        const bgImage = computedStyle.backgroundImage;
                        const bgColor = computedStyle.backgroundColor;

                        // Check if there's an img tag inside
                        const imgTag = el.querySelector('img');
                        const hasImgTag = imgTag !== null;
                        const imgSrc = imgTag ? imgTag.src : null;

                        return { bgImage, bgColor, hasImgTag, imgSrc };
                    });

                    if (heroStyles.bgImage === 'none' && !heroStyles.hasImgTag) {
                        console.log(`    ⚠️  No hero background image detected`);
                        findings.push({
                            page: testPage.name,
                            viewport: viewport.name,
                            severity: 'HIGH',
                            issue: 'Hero section missing background image'
                        });
                    } else {
                        console.log(`    ✓ Hero background present`);
                    }
                } else {
                    console.log(`    ⚠️  No hero section found`);
                }

                // Scroll and capture full page
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(1000);

                const fullScreenshot = `screenshots/${viewport.name}-${testPage.name.toLowerCase().replace(/\s+/g, '-')}-full.png`;
                await page.screenshot({
                    path: fullScreenshot,
                    fullPage: true
                });
                console.log(`    📸 Full page captured: ${fullScreenshot}`);

                // Check for empty sections or excessive whitespace
                const spacingIssues = await page.evaluate(() => {
                    const sections = document.querySelectorAll('section');
                    const issues = [];

                    sections.forEach((section, index) => {
                        const rect = section.getBoundingClientRect();
                        const computedStyle = window.getComputedStyle(section);
                        const paddingTop = parseInt(computedStyle.paddingTop);
                        const paddingBottom = parseInt(computedStyle.paddingBottom);
                        const marginTop = parseInt(computedStyle.marginTop);
                        const marginBottom = parseInt(computedStyle.marginBottom);

                        // Check if section is nearly empty
                        const textContent = section.textContent.trim();
                        const hasVisibleContent = section.querySelector('img, video, canvas') || textContent.length > 10;

                        if (!hasVisibleContent) {
                            issues.push(`Section ${index + 1}: Appears empty (no visible content)`);
                        }

                        // Check for excessive spacing
                        const totalVerticalSpace = paddingTop + paddingBottom + marginTop + marginBottom;
                        if (totalVerticalSpace > 400) {
                            issues.push(`Section ${index + 1}: Excessive vertical spacing (${totalVerticalSpace}px)`);
                        }
                    });

                    return issues;
                });

                if (spacingIssues.length > 0) {
                    spacingIssues.forEach(issue => {
                        console.log(`    ⚠️  ${issue}`);
                        findings.push({
                            page: testPage.name,
                            viewport: viewport.name,
                            severity: 'MEDIUM',
                            issue: issue
                        });
                    });
                }

                // Check typography consistency
                const typographyCheck = await page.evaluate(() => {
                    const headings = {
                        h1: [...document.querySelectorAll('h1')],
                        h2: [...document.querySelectorAll('h2')],
                        h3: [...document.querySelectorAll('h3')]
                    };

                    const issues = [];

                    Object.keys(headings).forEach(tag => {
                        const elements = headings[tag];
                        if (elements.length > 0) {
                            const fontSizes = new Set();
                            const fontFamilies = new Set();

                            elements.forEach(el => {
                                const style = window.getComputedStyle(el);
                                fontSizes.add(style.fontSize);
                                fontFamilies.add(style.fontFamily);
                            });

                            if (fontSizes.size > 2) {
                                issues.push(`${tag.toUpperCase()}: Inconsistent font sizes (${fontSizes.size} different sizes)`);
                            }
                            if (fontFamilies.size > 1) {
                                issues.push(`${tag.toUpperCase()}: Inconsistent font families`);
                            }
                        }
                    });

                    return issues;
                });

                if (typographyCheck.length > 0) {
                    typographyCheck.forEach(issue => {
                        console.log(`    ⚠️  Typography: ${issue}`);
                        findings.push({
                            page: testPage.name,
                            viewport: viewport.name,
                            severity: 'LOW',
                            issue: issue
                        });
                    });
                }

                // Check for horizontal overflow
                const overflowCheck = await page.evaluate(() => {
                    const bodyWidth = document.body.scrollWidth;
                    const windowWidth = window.innerWidth;
                    return bodyWidth > windowWidth ? bodyWidth - windowWidth : 0;
                });

                if (overflowCheck > 0) {
                    console.log(`    ⚠️  Horizontal overflow detected: ${overflowCheck}px`);
                    findings.push({
                        page: testPage.name,
                        viewport: viewport.name,
                        severity: 'HIGH',
                        issue: `Horizontal overflow: ${overflowCheck}px`
                    });
                }

                console.log(`    ✓ Audit complete`);

            } catch (error) {
                console.log(`    ❌ Error: ${error.message}`);
                findings.push({
                    page: testPage.name,
                    viewport: viewport.name,
                    severity: 'CRITICAL',
                    issue: `Page error: ${error.message}`
                });
            }
        }

        await context.close();
    }

    await browser.close();

    // Generate audit report
    console.log('\n\n' + '═'.repeat(60));
    console.log('📊 DESIGN AUDIT REPORT');
    console.log('═'.repeat(60));

    const criticalIssues = findings.filter(f => f.severity === 'CRITICAL');
    const highIssues = findings.filter(f => f.severity === 'HIGH');
    const mediumIssues = findings.filter(f => f.severity === 'MEDIUM');
    const lowIssues = findings.filter(f => f.severity === 'LOW');

    console.log(`\n🔴 CRITICAL: ${criticalIssues.length} issues`);
    criticalIssues.forEach(f => {
        console.log(`   • [${f.page}] [${f.viewport}] ${f.issue}`);
    });

    console.log(`\n🟠 HIGH: ${highIssues.length} issues`);
    highIssues.forEach(f => {
        console.log(`   • [${f.page}] [${f.viewport}] ${f.issue}`);
    });

    console.log(`\n🟡 MEDIUM: ${mediumIssues.length} issues`);
    mediumIssues.forEach(f => {
        console.log(`   • [${f.page}] [${f.viewport}] ${f.issue}`);
    });

    console.log(`\n🟢 LOW: ${lowIssues.length} issues`);
    lowIssues.forEach(f => {
        console.log(`   • [${f.page}] [${f.viewport}] ${f.issue}`);
    });

    console.log(`\n\nTotal issues found: ${findings.length}`);

    // Write detailed report to file
    const reportContent = `# Wright Key Property - Design Audit Report
Generated: ${new Date().toISOString()}

## Executive Summary
- **Total Issues**: ${findings.length}
- **Critical**: ${criticalIssues.length}
- **High**: ${highIssues.length}
- **Medium**: ${mediumIssues.length}
- **Low**: ${lowIssues.length}

## Detailed Findings

### 🔴 CRITICAL ISSUES (${criticalIssues.length})
${criticalIssues.map(f => `- **[${f.page}]** [${f.viewport}] ${f.issue}`).join('\n')}

### 🟠 HIGH PRIORITY ISSUES (${highIssues.length})
${highIssues.map(f => `- **[${f.page}]** [${f.viewport}] ${f.issue}`).join('\n')}

### 🟡 MEDIUM PRIORITY ISSUES (${mediumIssues.length})
${mediumIssues.map(f => `- **[${f.page}]** [${f.viewport}] ${f.issue}`).join('\n')}

### 🟢 LOW PRIORITY ISSUES (${lowIssues.length})
${lowIssues.map(f => `- **[${f.page}]** [${f.viewport}] ${f.issue}`).join('\n')}

## Screenshots Location
All screenshots saved to: \`screenshots/\` directory

Format: \`{viewport}-{page-name}-{type}.png\`
- Types: hero, full

## Recommendations
1. Address all CRITICAL and HIGH priority issues immediately
2. Review hero sections to ensure all have background images
3. Check spacing consistency across viewports
4. Verify no horizontal overflow on any viewport
5. Ensure preloader dismisses within 3 seconds on all pages
`;

    fs.writeFileSync('DESIGN_AUDIT_REPORT.md', reportContent);
    console.log('\n📄 Detailed report saved to: DESIGN_AUDIT_REPORT.md');
    console.log('\n✅ Design audit complete!');
}

// Create screenshots directory if it doesn't exist
if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
}

designAudit().catch(console.error);
