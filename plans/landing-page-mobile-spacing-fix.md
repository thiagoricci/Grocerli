# Landing Page Mobile Spacing Fix

## Problem

The text "Create a Shopping List Right from Your Phone" and the CTA button are positioned too low on mobile devices, requiring users to scroll and creating poor visual hierarchy.

## Root Cause

The image container in `LandingPage.tsx` uses `flex-1` class which causes it to expand and fill all available vertical space on mobile screens, pushing the text and button section too far down.

## Solution

Adjust the mobile layout to reduce vertical spacing between the image and text/button section.

## Changes Required

### File: `src/pages/LandingPage.tsx`

**Line 8 - Image Container:**

- Current: `className="flex-1 flex items-center justify-center p-4 md:p-8"`
- Change to: `className="flex items-center justify-center p-4 pb-2 md:p-8 md:pb-4"` on mobile
- OR: Add max-height constraint: `className="flex items-center justify-center p-4 pb-2 max-h-[45vh] md:p-8 md:pb-4 md:max-h-none"`

**Line 15 - Text/Button Container:**

- Current: `className="bg-white p-6 md:p-8 rounded-t-3xl shadow-lg flex-shrink-0"`
- Change to: `className="bg-white p-4 md:p-8 rounded-t-3xl shadow-lg flex-shrink-0"`

**Line 19 - Subtitle:**

- Current: `className="text-gray-600 text-center mb-6 md:mb-8 text-sm md:text-base"`
- Change to: `className="text-gray-600 text-center mb-4 md:mb-8 text-sm md:text-base"`

## Implementation Notes

- Use Tailwind's responsive prefixes (`md:`) to maintain desktop layout while optimizing for mobile
- The goal is to bring the text and button closer to the image without making it feel cramped
- Test on actual mobile devices or browser dev tools with mobile viewport simulation

## Expected Outcome

On mobile devices, the text and button will be positioned closer to the image, reducing the need to scroll and improving the visual hierarchy of the landing page.
