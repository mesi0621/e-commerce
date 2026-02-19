# Mobile-First Responsive Design - Design Document

## Architecture Overview

### Mobile-First Approach
Start with mobile base styles, then progressively enhance for larger screens using `min-width` media queries.

```css
/* Mobile base (320px+) */
.container { width: 100%; padding: 16px; }

/* Tablet enhancement (768px+) */
@media (min-width: 768px) {
  .container { padding: 24px; }
}

/* Desktop enhancement (1024px+) */
@media (min-width: 1024px) {
  .container { max-width: 1200px; margin: 0 auto; }
}
```

## Breakpoint Strategy

### Breakpoints
```css
/* CSS Custom Properties */
:root {
  --breakpoint-sm: 640px;   /* Small tablets */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Small desktops */
  --breakpoint-xl: 1280px;  /* Large desktops */
  --breakpoint-2xl: 1536px; /* Extra large */
}
```

### Usage Pattern
```css
/* Mobile first - no media query needed */
.element { /* mobile styles */ }

/* Tablet and up */
@media (min-width: 768px) { /* tablet styles */ }

/* Desktop and up */
@media (min-width: 1024px) { /* desktop styles */ }
```

## Component Designs

### 1. Responsive Navigation

#### Mobile (< 768px)
```jsx
<nav className="mobile-nav">
  <div className="nav-header">
    <button className="hamburger-menu">☰</button>
    <div className="logo">MODO</div>
    <div className="nav-icons">
      <button className="search-icon">🔍</button>
      <button className="cart-icon">🛒 <span>3</span></button>
    </div>
  </div>
  
  <div className="mobile-drawer">
    {/* Slide-out menu */}
    <ul>
      <li>Shop</li>
      <li>Men</li>
      <li>Women</li>
      <li>Kids</li>
      <li>Login</li>
    </ul>
  </div>
</nav>
```

#### Tablet/Desktop (768px+)
```jsx
<nav className="desktop-nav">
  <div className="logo">MODO</div>
  <ul className="nav-links">
    <li>Shop</li>
    <li>Men</li>
    <li>Women</li>
    <li>Kids</li>
  </ul>
  <div className="nav-actions">
    <input type="search" placeholder="Search..." />
    <button>Login</button>
    <button className="cart">🛒 3</button>
  </div>
</nav>
```

### 2. Product Grid

#### Layout Strategy
```css
/* Mobile: 1-2 columns */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  padding: 16px;
}

/* Tablet: 2-3 columns */
@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 24px;
    padding: 24px;
  }
}

/* Desktop: 3-4 columns */
@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### 3. Product Card

#### Mobile-First Design
```jsx
<div className="product-card">
  <div className="product-image">
    <img 
      src={mobileImage} 
      srcSet={`${mobileImage} 320w, ${tabletImage} 768w, ${desktopImage} 1024w`}
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      alt={product.name}
      loading="lazy"
    />
  </div>
  <div className="product-info">
    <h3 className="product-name">{product.name}</h3>
    <div className="product-price">
      <span className="new-price">${product.new_price}</span>
      <span className="old-price">${product.old_price}</span>
    </div>
  </div>
</div>
```

### 4. Product Detail Page

#### Mobile Layout (Stacked)
```jsx
<div className="product-detail mobile">
  <div className="product-images">
    {/* Full-width image gallery */}
    <div className="main-image">
      <img src={product.image} alt={product.name} />
    </div>
    <div className="thumbnail-strip">
      {/* Horizontal scrolling thumbnails */}
    </div>
  </div>
  
  <div className="product-info">
    <h1>{product.name}</h1>
    <div className="price">${product.new_price}</div>
    <div className="rating">⭐⭐⭐⭐⭐</div>
    
    <div className="size-selector">
      {/* Touch-friendly size buttons */}
    </div>
    
    <div className="quantity-selector">
      {/* Large +/- buttons */}
    </div>
    
    <button className="add-to-cart-btn">
      ADD TO CART
    </button>
    
    <div className="description">
      {product.description}
    </div>
  </div>
</div>
```

#### Desktop Layout (Side-by-side)
```jsx
<div className="product-detail desktop">
  <div className="product-images">
    {/* Left side: Image gallery */}
  </div>
  
  <div className="product-info">
    {/* Right side: Product details */}
  </div>
</div>
```

### 5. Shopping Cart

#### Mobile Layout
```css
.cart-mobile {
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.cart-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.cart-item-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.cart-item-details {
  flex: 1;
}

.cart-summary {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 16px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
```

#### Desktop Layout
```css
@media (min-width: 1024px) {
  .cart-desktop {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 32px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px;
  }
  
  .cart-items {
    /* Left column */
  }
  
  .cart-summary {
    /* Right column - sticky */
    position: sticky;
    top: 100px;
    height: fit-content;
  }
}
```

### 6. Checkout Page

#### Mobile (Step-by-step)
```jsx
<div className="checkout-mobile">
  <div className="progress-bar">
    <div className="step active">1. Shipping</div>
    <div className="step">2. Payment</div>
    <div className="step">3. Review</div>
  </div>
  
  <div className="checkout-step">
    {/* One step at a time */}
    <form className="shipping-form">
      {/* Full-width form fields */}
    </form>
  </div>
  
  <div className="sticky-footer">
    <div className="total">Total: $150.00</div>
    <button className="continue-btn">Continue</button>
  </div>
</div>
```

#### Desktop (All visible)
```jsx
<div className="checkout-desktop">
  <div className="checkout-form">
    {/* Left: All forms visible */}
    <section className="shipping-section">...</section>
    <section className="payment-section">...</section>
  </div>
  
  <aside className="order-summary">
    {/* Right: Sticky summary */}
  </aside>
</div>
```

## Touch Interactions

### Touch Target Sizes
```css
/* Minimum touch target: 44x44px */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}

/* Buttons */
.btn-mobile {
  height: 48px;
  padding: 0 24px;
  font-size: 16px;
}

/* Form inputs */
.input-mobile {
  height: 48px;
  padding: 12px 16px;
  font-size: 16px; /* Prevents zoom on iOS */
}
```

### Swipe Gestures
```jsx
// Image gallery swipe
const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX;
};

const handleTouchEnd = (e) => {
  touchEndX = e.changedTouches[0].clientX;
  handleSwipe();
};

const handleSwipe = () => {
  if (touchStartX - touchEndX > 50) {
    // Swipe left - next image
    nextImage();
  }
  if (touchEndX - touchStartX > 50) {
    // Swipe right - previous image
    previousImage();
  }
};
```

## Performance Optimizations

### 1. Lazy Loading Images
```jsx
<img 
  src={placeholder}
  data-src={actualImage}
  loading="lazy"
  className="lazy-image"
  alt={product.name}
/>
```

### 2. Responsive Images
```jsx
<picture>
  <source 
    media="(max-width: 767px)" 
    srcSet={`${mobileImage} 1x, ${mobileImage2x} 2x`}
  />
  <source 
    media="(max-width: 1023px)" 
    srcSet={`${tabletImage} 1x, ${tabletImage2x} 2x`}
  />
  <img 
    src={desktopImage} 
    srcSet={`${desktopImage} 1x, ${desktopImage2x} 2x`}
    alt={product.name}
  />
</picture>
```

### 3. Code Splitting
```jsx
// Lazy load components
const Checkout = lazy(() => import('./Pages/Checkout'));
const AdminDashboard = lazy(() => import('./Pages/AdminDashboard'));

// Use Suspense
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/admin" element={<AdminDashboard />} />
  </Routes>
</Suspense>
```

## CSS Architecture

### File Structure
```
src/
  styles/
    base/
      _reset.css
      _typography.css
      _variables.css
    components/
      _navbar.css
      _product-card.css
      _button.css
    layouts/
      _grid.css
      _container.css
    utilities/
      _spacing.css
      _responsive.css
```

### CSS Custom Properties
```css
:root {
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* Font sizes */
  --font-xs: 12px;
  --font-sm: 14px;
  --font-base: 16px;
  --font-lg: 18px;
  --font-xl: 20px;
  --font-2xl: 24px;
  
  /* Responsive font sizes */
  --font-heading: clamp(24px, 5vw, 32px);
  --font-body: clamp(16px, 2vw, 18px);
}
```

## Accessibility

### Keyboard Navigation
```jsx
// Ensure all interactive elements are keyboard accessible
<button 
  onClick={handleClick}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
  tabIndex={0}
  aria-label="Add to cart"
>
  Add to Cart
</button>
```

### Screen Reader Support
```jsx
<nav aria-label="Main navigation">
  <button 
    aria-label="Open menu"
    aria-expanded={isMenuOpen}
    aria-controls="mobile-menu"
  >
    ☰
  </button>
  
  <div 
    id="mobile-menu"
    role="menu"
    aria-hidden={!isMenuOpen}
  >
    {/* Menu items */}
  </div>
</nav>
```

## Testing Strategy

### Responsive Testing
- Test on real devices (iPhone, Android, iPad)
- Use Chrome DevTools device emulation
- Test all breakpoints
- Test landscape and portrait orientations
- Test with different font sizes

### Performance Testing
- Lighthouse mobile audit
- WebPageTest on 3G connection
- Core Web Vitals monitoring
- Image optimization verification
- Bundle size analysis

### Accessibility Testing
- WAVE accessibility checker
- axe DevTools
- Keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Color contrast verification

## Implementation Priority

### Phase 1: Core Mobile (Week 1)
1. Mobile navigation with hamburger menu
2. Responsive product grid (1-2 columns)
3. Mobile product detail page
4. Touch-friendly cart
5. Mobile checkout flow

### Phase 2: Tablet Enhancement (Days 3-4)
6. Tablet navigation
7. 2-3 column product grid
8. Two-column layouts
9. Enhanced touch interactions

### Phase 3: Desktop Enhancement (Days 3-4)
10. Desktop navigation with hover
11. 3-4 column product grid
12. Multi-column layouts
13. Desktop-specific features

### Phase 4: Polish (Days 2-3)
14. Performance optimization
15. Image lazy loading
16. Animation polish
17. Final testing and fixes

## Success Criteria

### Performance
- Mobile Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Largest Contentful Paint < 2.5s

### User Experience
- All touch targets ≥ 44x44px
- No horizontal scrolling
- Smooth animations (60fps)
- Fast tap response (< 100ms)

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation works
- Screen reader compatible
- Color contrast ratios pass

## Technical Stack

- **React**: 19.2.0
- **CSS**: Modern CSS with Grid/Flexbox
- **Media Queries**: Mobile-first approach
- **Images**: Responsive images with srcset
- **Performance**: Lazy loading, code splitting
- **Testing**: Chrome DevTools, Lighthouse
