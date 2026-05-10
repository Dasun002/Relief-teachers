# Modern Design System Documentation

## Overview

This design system provides a comprehensive set of design tokens, components, and utilities for building a modern, engaging, and accessible user interface for the Teacher Attendance and Substitution Management System.

## Table of Contents

1. [Theme System](#theme-system)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animations](#animations)
7. [Accessibility](#accessibility)
8. [Usage Examples](#usage-examples)

---

## Theme System

### Files Structure

```
frontend/src/styles/
├── theme.css          # Design tokens and CSS variables
├── animations.css     # Animation utilities and keyframes
├── components.css     # Reusable component styles
└── responsive.css     # Responsive design utilities
```

### CSS Custom Properties

All design tokens are defined as CSS custom properties (variables) in `theme.css`, making them easy to customize and maintain.

### Dark Mode Support

The system includes automatic dark mode support via:
- `@media (prefers-color-scheme: dark)` - Automatic based on system preference
- `[data-theme="dark"]` - Manual toggle support

---

## Color Palette

### Primary Colors
Used for main actions, links, and brand elements.

```css
--primary-500: #3b82f6  /* Main primary color */
--primary-600: #2563eb  /* Hover state */
--primary-700: #1d4ed8  /* Active state */
```

### Semantic Colors

#### Success (Green)
```css
--success-500: #22c55e
--success-600: #16a34a
```

#### Warning (Amber)
```css
--warning-500: #f59e0b
--warning-600: #d97706
```

#### Error (Red)
```css
--error-500: #ef4444
--error-600: #dc2626
```

#### Info (Blue)
```css
--info-500: #0ea5e9
--info-600: #0284c7
```

### Neutral Colors
Used for text, borders, and backgrounds.

```css
--color-text-primary: #111827
--color-text-secondary: #6b7280
--color-text-tertiary: #9ca3af
--color-background: #ffffff
--color-background-secondary: #f9fafb
--color-border: #e5e7eb
```

### Gradients

Pre-defined gradients for visual appeal:

```css
--gradient-primary: linear-gradient(135deg, #2563eb 0%, #1e40af 100%)
--gradient-cool: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)
--gradient-sunset: linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)
--gradient-ocean: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)
```

---

## Typography

### Font Families

```css
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', ...
--font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, ...
```

### Font Sizes

```css
--font-size-xs: 0.75rem    /* 12px */
--font-size-sm: 0.875rem   /* 14px */
--font-size-base: 1rem     /* 16px */
--font-size-lg: 1.125rem   /* 18px */
--font-size-xl: 1.25rem    /* 20px */
--font-size-2xl: 1.5rem    /* 24px */
--font-size-3xl: 1.875rem  /* 30px */
--font-size-4xl: 2.25rem   /* 36px */
--font-size-5xl: 3rem      /* 48px */
```

### Font Weights

```css
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

---

## Spacing & Layout

### Spacing Scale

```css
--spacing-xs: 0.25rem   /* 4px */
--spacing-sm: 0.5rem    /* 8px */
--spacing-md: 1rem      /* 16px */
--spacing-lg: 1.5rem    /* 24px */
--spacing-xl: 2rem      /* 32px */
--spacing-2xl: 3rem     /* 48px */
--spacing-3xl: 4rem     /* 64px */
```

### Border Radius

```css
--radius-sm: 0.25rem    /* 4px */
--radius-md: 0.375rem   /* 6px */
--radius-lg: 0.5rem     /* 8px */
--radius-xl: 0.75rem    /* 12px */
--radius-2xl: 1rem      /* 16px */
--radius-full: 9999px   /* Fully rounded */
```

### Shadows

```css
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

Colored shadows for emphasis:
```css
--shadow-primary: 0 10px 15px -3px rgba(59, 130, 246, 0.3)
--shadow-success: 0 10px 15px -3px rgba(34, 197, 94, 0.3)
--shadow-error: 0 10px 15px -3px rgba(239, 68, 68, 0.3)
```

---

## Components

### Buttons

#### Variants

**Primary Button**
```html
<button class="btn btn-primary">Primary Action</button>
```
- Gradient background
- Hover lift effect
- Colored shadow

**Secondary Button**
```html
<button class="btn btn-secondary">Secondary Action</button>
```

**Success/Warning/Error Buttons**
```html
<button class="btn btn-success">Success</button>
<button class="btn btn-warning">Warning</button>
<button class="btn btn-error">Error</button>
```

**Ghost & Outline**
```html
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-outline">Outline</button>
```

#### Sizes

```html
<button class="btn btn-sm">Small</button>
<button class="btn">Default</button>
<button class="btn btn-lg">Large</button>
```

### Cards

#### Basic Card
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-subtitle">Card subtitle</p>
  </div>
  <div class="card-body">
    Card content goes here
  </div>
</div>
```

#### Interactive Card
```html
<div class="card card-interactive">
  <!-- Hover effects enabled -->
</div>
```

#### Glass Card
```html
<div class="card card-glass">
  <!-- Glassmorphism effect -->
</div>
```

#### Gradient Card
```html
<div class="card card-gradient">
  <!-- Gradient background -->
</div>
```

### Badges

```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
<span class="badge badge-info">Info</span>
```

With dot indicator:
```html
<span class="badge badge-success badge-dot">Active</span>
```

### Inputs

```html
<div class="input-group">
  <label class="input-label">Email Address</label>
  <input type="email" class="input" placeholder="Enter email">
  <span class="input-hint">We'll never share your email</span>
</div>
```

Error state:
```html
<input type="text" class="input input-error">
<span class="input-error-message">This field is required</span>
```

### Alerts

```html
<div class="alert alert-success">
  <div class="alert-icon">✓</div>
  <div class="alert-content">
    <h4 class="alert-title">Success!</h4>
    <p class="alert-message">Your changes have been saved.</p>
  </div>
</div>
```

Variants: `alert-success`, `alert-warning`, `alert-error`, `alert-info`

### Stat Cards

```html
<div class="stat-card">
  <div class="stat-card-icon stat-card-icon-primary">
    📊
  </div>
  <h3 class="stat-card-value">1,234</h3>
  <p class="stat-card-label">Total Users</p>
  <span class="stat-card-trend stat-card-trend-up">
    ↑ 12% from last month
  </span>
</div>
```

### Progress Bar

```html
<div class="progress">
  <div class="progress-bar" style="width: 75%"></div>
</div>
```

### Avatar

```html
<div class="avatar">JD</div>
<div class="avatar avatar-lg">
  <img src="profile.jpg" alt="User">
</div>
```

---

## Animations

### Utility Classes

#### Fade Animations
```html
<div class="animate-fade-in">Fades in</div>
<div class="animate-fade-in-up">Fades in from bottom</div>
<div class="animate-fade-in-down">Fades in from top</div>
<div class="animate-fade-in-left">Fades in from left</div>
<div class="animate-fade-in-right">Fades in from right</div>
```

#### Slide Animations
```html
<div class="animate-slide-in-up">Slides up</div>
<div class="animate-slide-in-down">Slides down</div>
<div class="animate-slide-in-left">Slides from left</div>
<div class="animate-slide-in-right">Slides from right</div>
```

#### Scale Animations
```html
<div class="animate-scale-in">Scales in</div>
<div class="animate-zoom-in">Zooms in</div>
```

#### Continuous Animations
```html
<div class="animate-pulse">Pulses</div>
<div class="animate-bounce">Bounces</div>
<div class="animate-spin">Spins</div>
<div class="animate-float">Floats</div>
```

#### Hover Effects
```html
<div class="hover-lift">Lifts on hover</div>
<div class="hover-scale">Scales on hover</div>
<div class="hover-glow">Glows on hover</div>
```

#### Staggered Animations
```html
<div class="animate-stagger">
  <div>Item 1 (0ms delay)</div>
  <div>Item 2 (100ms delay)</div>
  <div>Item 3 (200ms delay)</div>
</div>
```

### Loading States

#### Skeleton Loader
```html
<div class="skeleton" style="width: 200px; height: 20px;"></div>
```

#### Spinner
```html
<div class="spinner-container">
  <div class="spinner spinner-medium"></div>
  <p class="spinner-text">Loading...</p>
</div>
```

### Transition Utilities

```html
<div class="transition-all">Transitions all properties</div>
<div class="transition-colors">Transitions colors only</div>
<div class="transition-transform">Transitions transform only</div>
<div class="transition-opacity">Transitions opacity only</div>
```

Speed modifiers:
```html
<div class="transition-all transition-fast">Fast transition</div>
<div class="transition-all transition-slow">Slow transition</div>
```

---

## Accessibility

### Focus States

All interactive elements have visible focus indicators:
```css
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Reduced Motion

Respects user's motion preferences:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast Mode

Enhanced borders and outlines in high contrast mode:
```css
@media (prefers-contrast: high) {
  button, input, select, textarea {
    border-width: 2px;
  }
}
```

### Touch Targets

Minimum 44x44px touch targets on mobile:
```css
@media (hover: none) and (pointer: coarse) {
  button, a, input {
    min-height: 44px;
  }
}
```

### Screen Reader Support

```html
<span class="sr-only">Screen reader only text</span>
```

---

## Usage Examples

### Modern Login Page

```jsx
<div className="login-page">
  <div className="login-container">
    <h1 className="login-title">Welcome Back</h1>
    <form className="login-form">
      <div className="input-group">
        <label className="input-label">Email</label>
        <input type="email" className="input" />
      </div>
      <button className="btn btn-primary btn-block">
        Sign In
      </button>
    </form>
  </div>
</div>
```

### Dashboard with Stat Cards

```jsx
<div className="dashboard-page">
  <div className="dashboard-grid animate-stagger">
    <div className="stat-card">
      <div className="stat-card-icon stat-card-icon-primary">
        👥
      </div>
      <h3 className="stat-card-value">245</h3>
      <p className="stat-card-label">Total Teachers</p>
    </div>
    {/* More stat cards... */}
  </div>
</div>
```

### Interactive Card with Hover Effect

```jsx
<div className="card card-interactive hover-lift">
  <div className="card-body">
    <h3 className="card-title">Attendance Management</h3>
    <p className="card-subtitle">Track daily attendance</p>
  </div>
</div>
```

### Toast Notification

```jsx
<div className="toast toast-success">
  <div className="toast-content">
    <div className="toast-icon-wrapper">
      <svg className="toast-icon">...</svg>
    </div>
    <p className="toast-message">Successfully saved!</p>
  </div>
  <button className="toast-close">×</button>
</div>
```

---

## Best Practices

### 1. Use Design Tokens

Always use CSS custom properties instead of hardcoded values:

✅ **Good:**
```css
color: var(--color-primary);
padding: var(--spacing-md);
```

❌ **Bad:**
```css
color: #3b82f6;
padding: 16px;
```

### 2. Leverage Utility Classes

Use pre-built animation and transition classes:

✅ **Good:**
```html
<div class="card hover-lift animate-fade-in">
```

❌ **Bad:**
```css
.my-card {
  animation: fadeIn 0.3s;
  transition: transform 0.2s;
}
.my-card:hover {
  transform: translateY(-4px);
}
```

### 3. Maintain Consistency

Use the same component patterns throughout the app:
- Same button styles for similar actions
- Consistent spacing between elements
- Uniform border radius values

### 4. Consider Performance

- Use `will-change` for frequently animated elements
- Prefer `transform` and `opacity` for animations
- Use `gpu-accelerated` class for complex animations

### 5. Test Accessibility

- Test with keyboard navigation
- Verify screen reader compatibility
- Check color contrast ratios
- Test with reduced motion enabled

---

## Customization

### Changing Primary Color

Update the primary color scale in `theme.css`:

```css
:root {
  --primary-500: #your-color;
  --primary-600: #your-darker-color;
  /* Update other shades... */
}
```

### Adding Custom Animations

Add new keyframes in `animations.css`:

```css
@keyframes myAnimation {
  from { /* start state */ }
  to { /* end state */ }
}

.animate-my-animation {
  animation: myAnimation 0.5s ease-out;
}
```

### Creating Custom Components

Follow the existing pattern in `components.css`:

```css
.my-component {
  /* Base styles */
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  transition: all var(--transition-base);
}

.my-component:hover {
  /* Hover state */
  box-shadow: var(--shadow-md);
}
```

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android

---

## Performance Considerations

1. **CSS Variables**: Minimal performance impact, excellent browser support
2. **Animations**: Hardware-accelerated transforms and opacity
3. **Backdrop Filter**: May impact performance on older devices
4. **Gradients**: Optimized for modern browsers

---

## Migration Guide

### From Old Styles to New Design System

1. **Replace hardcoded colors:**
   ```css
   /* Old */
   color: #3b82f6;
   
   /* New */
   color: var(--color-primary);
   ```

2. **Use new component classes:**
   ```html
   <!-- Old -->
   <button class="login-button">Submit</button>
   
   <!-- New -->
   <button class="btn btn-primary">Submit</button>
   ```

3. **Add animations:**
   ```html
   <!-- Old -->
   <div class="card">
   
   <!-- New -->
   <div class="card animate-fade-in-up">
   ```

---

## Support & Resources

- **Documentation**: This file
- **Theme File**: `frontend/src/styles/theme.css`
- **Animations**: `frontend/src/styles/animations.css`
- **Components**: `frontend/src/styles/components.css`

For questions or issues, refer to the implementation files or create an issue in the project repository.
