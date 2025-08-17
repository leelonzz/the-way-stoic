# Hide-on-Scroll Header Implementation

## Overview
The application now features a smooth hide-on-scroll header behavior that enhances user experience by maximizing content visibility while maintaining easy access to navigation.

## Features

### ✅ **Hide when scrolling down**
- Header smoothly slides up and disappears when user scrolls down
- Provides more screen real estate for content

### ✅ **Show when scrolling up** 
- Header smoothly slides back down when user scrolls up
- Ensures navigation is always accessible when needed

### ✅ **Global implementation**
- Works on all pages that show the header (blog posts, philosopher pages, etc.)
- Excludes home page, login, and app routes (journal, calendar, quotes, mentors, settings)

### ✅ **Smooth animations**
- Uses Tailwind CSS transitions with 300ms duration
- Includes backdrop blur effect for polished appearance
- Opacity transitions for seamless visibility changes

### ✅ **Smart scroll threshold**
- 100px minimum scroll distance prevents flickering on small movements
- Header always appears when user reaches the top of the page
- Intelligent direction detection with debouncing

### ✅ **Proper layout handling**
- Fixed positioning with automatic padding compensation
- MainContent component handles spacing based on header visibility
- No layout shift or content jumping

## Technical Implementation

### Files Created/Modified

1. **`src/hooks/useScrollDirection.ts`** - Custom hook for scroll detection
   - Tracks scroll direction and position
   - Handles edge cases and initialization
   - Optimized with requestAnimationFrame

2. **`src/components/layout/Header.tsx`** - Updated header component
   - Integrated scroll direction hook
   - Added smooth transitions and backdrop blur
   - Changed from sticky to fixed positioning

3. **`src/components/layout/MainContent.tsx`** - New wrapper component
   - Handles padding compensation for fixed header
   - Conditional spacing based on header visibility

4. **`app/layout.tsx`** - Updated root layout
   - Integrated MainContent wrapper
   - Maintains existing functionality

### Key Features

- **Performance optimized**: Uses requestAnimationFrame for smooth scrolling
- **SSR compatible**: Handles server-side rendering gracefully
- **Accessible**: Maintains all header functionality when visible
- **Responsive**: Works across all device sizes

## Usage

The hide-on-scroll behavior is automatically active on all pages that show the header. No additional configuration needed.

### Pages with hide-on-scroll header:
- Blog posts (`/blog/[slug]`)
- Philosopher biographies (`/biography/[mentor-slug]`)
- Any other pages not excluded by ConditionalHeader

### Pages without header (no hide-on-scroll):
- Home page (`/`)
- Login page (`/login`)
- App routes (`/journal`, `/calendar`, `/quotes`, `/mentors`, `/settings`)

## Testing

To test the implementation:

1. Navigate to any blog post or philosopher page
2. Scroll down - header should smoothly slide up and disappear
3. Scroll up - header should smoothly slide back down
4. Scroll to top - header should always be visible
5. Test on different screen sizes for responsiveness

## Browser Support

- Modern browsers with CSS transform support
- Graceful degradation for older browsers
- Mobile-optimized touch scrolling
