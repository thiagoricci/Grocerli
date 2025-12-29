# Landing Page Image Size Fix

## Problem

The landing page image is too large on mobile devices, taking up too much screen space and pushing the CTA button below the fold.

## Current Implementation

```tsx
<img
  src={landingImage}
  alt="Grocery shopping illustration"
  className="max-w-full h-auto w-full sm:w-80 md:w-96"
/>
```

**Issue**: `w-full` makes the image take up the full width on mobile (default breakpoint), which is too large.

## Solution

### Option 1: Add Maximum Width Constraint (Recommended)

Add a maximum width constraint for mobile while keeping responsive sizing:

```tsx
<img
  src={landingImage}
  alt="Grocery shopping illustration"
  className="max-w-full h-auto w-full max-w-[280px] sm:max-w-xs md:max-w-sm lg:max-w-md object-contain"
/>
```

**Breakdown:**

- `max-w-[280px]` - Maximum 280px width on very small screens (320px devices)
- `sm:max-w-xs` - Maximum 320px width on small mobile (640px+)
- `md:max-w-sm` - Maximum 384px width on medium screens (768px+)
- `lg:max-w-md` - Maximum 448px width on large screens (1024px+)
- `object-contain` - Ensures image maintains aspect ratio without cropping

### Option 2: Add Both Width and Height Constraints

For even more control, constrain both dimensions:

```tsx
<img
  src={landingImage}
  alt="Grocery shopping illustration"
  className="max-w-full h-auto w-full max-w-[280px] max-h-[280px] sm:max-w-xs sm:max-h-[320px] md:max-w-sm md:max-h-[384px] object-contain"
/>
```

### Option 3: Use Percentage-Based Sizing

Use percentage of viewport width:

```tsx
<img
  src={landingImage}
  alt="Grocery shopping illustration"
  className="max-w-full h-auto w-[85%] sm:w-[75%] md:w-[65%] max-w-[400px] object-contain"
/>
```

**Breakdown:**

- `w-[85%]` - 85% of viewport width on mobile
- `sm:w-[75%]` - 75% of viewport width on small screens
- `md:w-[65%]` - 65% of viewport width on medium screens
- `max-w-[400px]` - Never exceed 400px regardless of screen size

## Recommended Approach

**Option 1** is recommended because:

- Provides granular control across all breakpoints
- Uses Tailwind's semantic breakpoints (xs, sm, md)
- Ensures image never gets too large on any device
- Maintains aspect ratio with `object-contain`
- Simple and maintainable

## Files to Modify

1. **[`src/pages/LandingPage.tsx`](../src/pages/LandingPage.tsx)** - Update image className

## Implementation Steps

1. Open [`src/pages/LandingPage.tsx`](../src/pages/LandingPage.tsx)
2. Find the `<img>` element (line 9)
3. Replace the className with the recommended solution
4. Test on mobile devices (320px, 375px, 414px widths)
5. Adjust max-width values if needed

## Testing Checklist

- [ ] Test on iPhone SE (320px width)
- [ ] Test on iPhone 12/13 (390px width)
- [ ] Test on iPhone 14 Pro Max (430px width)
- [ ] Test on Android small screen (360px width)
- [ ] Test on Android large screen (412px width)
- [ ] Verify image is not too large
- [ ] Verify CTA button is visible without scrolling
- [ ] Verify image maintains aspect ratio
- [ ] Verify image quality is good

## Expected Outcome

- Image will be appropriately sized on mobile devices
- CTA button will be visible without excessive scrolling
- Image will scale gracefully across different screen sizes
- Better mobile user experience
