# Responsive Design Testing Guide

## Quick Start Testing

### 1. Start the Development Server
```bash
cd frontend
npm run dev
```

### 2. Open Browser DevTools
- **Chrome**: F12 or Ctrl+Shift+I (Cmd+Option+I on Mac)
- **Firefox**: F12 or Ctrl+Shift+I (Cmd+Option+I on Mac)
- **Safari**: Cmd+Option+I (enable Developer menu first)

### 3. Enable Responsive Design Mode
- **Chrome**: Click device toolbar icon or Ctrl+Shift+M (Cmd+Shift+M on Mac)
- **Firefox**: Click responsive design mode icon or Ctrl+Shift+M (Cmd+Option+M on Mac)
- **Safari**: Enter Responsive Design Mode from Develop menu

## Test Scenarios by Screen Size

### Mobile Portrait (320px - 480px)

#### Test: iPhone SE (320px width)
1. Set viewport to 320x568
2. Navigate to Dashboard
   - ✅ Cards stack vertically
   - ✅ Buttons are at least 48px tall
   - ✅ Text is readable (no zoom required)
   - ✅ Navigation shows hamburger menu

3. Navigate to Attendance Page
   - ✅ Tabs stack vertically
   - ✅ Date picker is full width
   - ✅ Teacher list items stack (name above buttons)
   - ✅ Present/Absent buttons are touch-friendly

4. Navigate to Substitution Page
   - ✅ Date selector stacks vertically
   - ✅ Tabs stack vertically
   - ✅ Modal overlays work properly

5. Test Navigation
   - ✅ Hamburger menu opens/closes
   - ✅ Menu items are touch-friendly (52px tall)
   - ✅ Overlay closes menu when clicked

#### Test: iPhone 12/13 (390px width)
1. Set viewport to 390x844
2. Repeat all tests from iPhone SE
3. Verify improved spacing with larger width

### Mobile Landscape (480px - 767px)

#### Test: iPhone 12 Landscape (844px width)
1. Set viewport to 844x390
2. Navigate to Dashboard
   - ✅ Cards display in 2 columns
   - ✅ Navigation remains accessible

3. Navigate to Attendance Page
   - ✅ Tabs display horizontally
   - ✅ Forms remain usable

### Tablet Portrait (768px - 1023px)

#### Test: iPad (768px width)
1. Set viewport to 768x1024
2. Navigate to Dashboard
   - ✅ Cards display in 2-3 columns
   - ✅ Desktop navigation appears
   - ✅ Spacing increases appropriately

3. Navigate to Attendance Page
   - ✅ Tabs display horizontally
   - ✅ Forms use 2-column layout where appropriate
   - ✅ Tables display properly

4. Navigate to Teacher Management
   - ✅ Teacher cards show actions inline
   - ✅ Forms display in optimal layout

### Desktop (1024px - 1919px)

#### Test: Standard Desktop (1440px width)
1. Set viewport to 1440x900
2. Navigate to Dashboard
   - ✅ Cards display in 4 columns
   - ✅ Full navigation bar visible
   - ✅ Optimal spacing and typography

3. Navigate to all pages
   - ✅ All components display in desktop layout
   - ✅ Tables show full width
   - ✅ Forms use multi-column layouts

### Large Desktop (1920px+)

#### Test: 4K Display (1920px width)
1. Set viewport to 1920x1080
2. Navigate to Dashboard
   - ✅ Content is centered with max-width
   - ✅ Cards display in 4 columns
   - ✅ No excessive whitespace

3. Navigate to all pages
   - ✅ Content remains readable
   - ✅ Layouts scale appropriately

## Touch Target Testing

### Minimum Size Requirements
- **WCAG 2.1 Level AAA**: 44x44px minimum
- **Our Implementation**: 44-48px on desktop, 48-56px on mobile

### Test Touch Targets
1. Open DevTools Console
2. Run this script to highlight small touch targets:
```javascript
document.querySelectorAll('button, a, input, select').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.width < 44 || rect.height < 44) {
    el.style.outline = '2px solid red';
    console.log('Small touch target:', el, `${rect.width}x${rect.height}`);
  }
});
```

3. Verify no elements are highlighted in red

## Accessibility Testing

### Keyboard Navigation
1. Tab through all interactive elements
2. Verify visible focus indicators
3. Test Enter/Space on buttons
4. Test Escape to close modals

### Screen Reader Testing
1. Enable screen reader (NVDA, JAWS, VoiceOver)
2. Navigate through pages
3. Verify all interactive elements are announced
4. Verify form labels are associated correctly

### Color Contrast
1. Use browser extension (WAVE, axe DevTools)
2. Verify all text meets WCAG AA standards (4.5:1 for normal text)
3. Verify interactive elements are distinguishable

### Reduced Motion
1. Enable reduced motion in OS settings:
   - **Windows**: Settings > Ease of Access > Display > Show animations
   - **macOS**: System Preferences > Accessibility > Display > Reduce motion
   - **iOS**: Settings > Accessibility > Motion > Reduce Motion

2. Verify animations are disabled or minimal

## Browser Testing

### Chrome Mobile (Android)
1. Use Chrome DevTools device emulation
2. Test with "Pixel 5" preset
3. Verify touch interactions work
4. Test horizontal scrolling on tables

### Safari Mobile (iOS)
1. Use Safari Responsive Design Mode
2. Test with "iPhone 13" preset
3. Verify no zoom on input focus (16px font size)
4. Test smooth scrolling on tables

### Desktop Browsers
1. Test on Chrome, Firefox, Safari, Edge
2. Verify consistent rendering
3. Test hover states
4. Verify keyboard navigation

## Performance Testing

### Mobile Network Simulation
1. Open DevTools Network tab
2. Set throttling to "Slow 3G"
3. Reload page
4. Verify page loads in reasonable time
5. Check for layout shifts (CLS)

### Lighthouse Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Mobile" device
4. Run audit
5. Verify scores:
   - Performance: > 90
   - Accessibility: > 95
   - Best Practices: > 90

## Common Issues to Check

### Mobile Issues
- [ ] Text too small (< 16px)
- [ ] Buttons too small (< 44px)
- [ ] Horizontal scrolling on page (not tables)
- [ ] Content cut off at edges
- [ ] Overlapping elements
- [ ] Zoom on input focus

### Tablet Issues
- [ ] Awkward breakpoint transitions
- [ ] Wasted whitespace
- [ ] Inconsistent layouts
- [ ] Navigation issues

### Desktop Issues
- [ ] Content too wide (> 1600px)
- [ ] Excessive whitespace
- [ ] Tiny text on large screens
- [ ] Hover states not working

## Automated Testing Script

Create a test file `responsive.test.js`:

```javascript
describe('Responsive Design', () => {
  const viewports = [
    { name: 'iPhone SE', width: 320, height: 568 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 },
    { name: '4K', width: 1920, height: 1080 }
  ];

  viewports.forEach(viewport => {
    it(`should render correctly on ${viewport.name}`, () => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit('/dashboard');
      cy.screenshot(`dashboard-${viewport.name}`);
      
      // Check for horizontal scroll
      cy.window().then(win => {
        expect(win.document.body.scrollWidth).to.equal(viewport.width);
      });
      
      // Check touch targets
      cy.get('button, a').each($el => {
        const rect = $el[0].getBoundingClientRect();
        expect(rect.width).to.be.at.least(44);
        expect(rect.height).to.be.at.least(44);
      });
    });
  });
});
```

## Sign-Off Checklist

Before marking task as complete:

- [ ] Tested on mobile (320px, 390px, 480px)
- [ ] Tested on tablet (768px, 1024px)
- [ ] Tested on desktop (1440px, 1920px)
- [ ] All touch targets meet 44x44px minimum
- [ ] Navigation hamburger menu works on mobile
- [ ] Tables scroll horizontally or transform to cards
- [ ] Forms are usable on all screen sizes
- [ ] Text is readable without zoom
- [ ] No horizontal scrolling (except tables)
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] Reduced motion is respected
- [ ] High contrast mode works
- [ ] Build completes without errors
- [ ] Lighthouse accessibility score > 95

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)
- [Safari Responsive Design Mode](https://developer.apple.com/safari/tools/)
