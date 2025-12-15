# Background Contrast Report
Generated: 2025-12-15T15:42:43.983Z

## Summary
- **Total Issues**: 1
- **Critical**: 0
- **High**: 1
- **Medium**: 0

## Findings

### 🔴 CRITICAL ISSUES (0)
None

### 🟠 HIGH PRIORITY ISSUES (1)
- **[Browse]** Light text on background image without overlay/tint - may have poor visibility
  - **Fix:** Add dark overlay (e.g., bg-gradient-to-b from-black/60 to-black/70) to hero section

### 🟡 MEDIUM PRIORITY ISSUES (0)
None

## Recommendations
1. All hero sections with background images and light text should have dark overlays
2. Use gradient overlays (e.g., `bg-gradient-to-b from-black/60 via-black/50 to-black/70`)
3. Ensure WCAG AA contrast ratio of at least 4.5:1 for normal text, 3:1 for large text
4. Test on multiple devices and lighting conditions

## Screenshots
All contrast check screenshots saved to: `screenshots/contrast-*.png`
