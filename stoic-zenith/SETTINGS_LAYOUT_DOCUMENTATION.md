# Settings Layout Documentation

## Overview

This document describes the new settings page layout that has been designed based on the provided screenshot structure. The layout follows modern design patterns while maintaining the exact positioning, spacing, and information architecture from the reference image.

## Layout Structure

### 1. Modal-Based Design
- **Overlay**: Full-screen modal with semi-transparent backdrop
- **Positioning**: Centered modal with proper z-index layering
- **Dimensions**: Responsive with max-width constraints and viewport height management

### 2. Two-Column Layout
- **Left Navigation**: 30% width (320px) - Navigation sidebar
- **Right Content**: 70% width - Main content area
- **Responsive**: Adapts to smaller screens with proper breakpoints

## Component Architecture

### Header Section
```
┌─────────────────────────────────────────────────────────┐
│ Account                                    [X] Close    │
└─────────────────────────────────────────────────────────┘
```

### Navigation Structure (Left Column)
```
┌─────────────────┐
│ ACCOUNT         │
│ ├─ Account      │
│ ├─ Preferences  │
│ ├─ Notifications│
│ └─ Connections  │
│                 │
│ WORKSPACE       │
│ ├─ General      │
│ ├─ People       │
│ └─ Teamspaces   │
│                 │
│ OTHER           │
│ ├─ Notion AI    │
│ ├─ Public pages │
│ ├─ Emoji        │
│ ├─ Connections  │
│ └─ Import       │
│                 │
│ [Upgrade plan]  │
│ [Refer a friend]│
└─────────────────┘
```

### Content Structure (Right Column)
```
┌─────────────────────────────────────────────────────────┐
│ Account                                                │
│ ┌─────┐ Preferred name                                 │
│ │ [A] │ [Input field]                                  │
│ └─────┘ [Create your portrait]                         │
│                                                        │
│ ────────────────────────────────────────────────────── │
│                                                        │
│ Account security                                       │
│ Email: user@example.com              [Change email]    │
│ Password: description                 [Add password]   │
│ 2-step verification: description      [Add method]     │
│ Passkeys: description                 [Add passkey]    │
│                                                        │
│ ────────────────────────────────────────────────────── │
│                                                        │
│ Support                                                │
│ Support access: description           [Toggle]         │
│ [Delete my account]                                   │
└─────────────────────────────────────────────────────────┘
```

## Spacing and Positioning

### Vertical Spacing
- **Section spacing**: 32px (space-y-8)
- **Subsection spacing**: 24px (space-y-6)
- **Item spacing**: 16px (space-y-4)
- **Element spacing**: 8px (space-y-2)

### Horizontal Spacing
- **Modal padding**: 24px (p-6)
- **Column gap**: 0px (border separation)
- **Content padding**: 24px (p-6)
- **Button spacing**: 12px (gap-3)

### Component Sizing
- **Avatar**: 64px × 64px (w-16 h-16)
- **Input fields**: Full width with proper padding
- **Buttons**: Auto-sized with consistent padding
- **Navigation items**: Full width with 12px horizontal padding

## Responsive Design

### Desktop (Default)
- Modal: max-width 1024px, height 90vh
- Left navigation: 320px fixed width
- Right content: Flexible width

### Tablet
- Modal: Full width with reduced padding
- Navigation: Collapsible or tabbed interface
- Content: Single column layout

### Mobile
- Modal: Full screen overlay
- Navigation: Bottom sheet or drawer
- Content: Stacked layout with full width

## Interactive Elements

### Navigation States
- **Default**: Gray text with hover effects
- **Active**: Blue background with white text
- **Hover**: Light gray background

### Form Elements
- **Input fields**: Focus states with blue border
- **Buttons**: Hover and active states
- **Switches**: Toggle states with smooth transitions

### Accessibility
- **Keyboard navigation**: Full tab support
- **Screen readers**: Proper ARIA labels
- **Focus management**: Visible focus indicators
- **Color contrast**: WCAG AA compliant

## Implementation Details

### File Structure
```
src/components/settings/
├── SettingsModal.tsx          # Modal-based layout
├── EnhancedSettingsPage.tsx   # Dual layout support
├── SettingsDemo.tsx          # Demo component
└── [existing files...]
```

### Key Components
1. **SettingsModal**: Pure modal implementation
2. **EnhancedSettingsPage**: Hybrid approach with layout switching
3. **Navigation**: Reusable navigation component
4. **Content Sections**: Modular content rendering

### State Management
- **Active section**: Tracks current navigation item
- **Layout mode**: Switches between traditional and modal
- **Form data**: Manages user input states
- **UI states**: Handles loading, error, and success states

## Usage Examples

### Basic Modal Usage
```tsx
import { SettingsModal } from '@/components/settings/SettingsModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <SettingsModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      profile={userProfile}
    />
  );
}
```

### Enhanced Page Usage
```tsx
import { EnhancedSettingsPage } from '@/components/settings/EnhancedSettingsPage';

function SettingsPage() {
  return (
    <EnhancedSettingsPage
      profile={userProfile}
    />
  );
}
```

## Design System Integration

### Colors
- Uses existing design system color tokens
- Maintains consistency with app theme
- Supports light/dark mode

### Typography
- Follows established font hierarchy
- Uses consistent font weights and sizes
- Maintains proper line heights

### Components
- Leverages existing UI components
- Extends with custom styling as needed
- Maintains component consistency

## Performance Considerations

### Optimization
- Lazy loading of content sections
- Memoized navigation rendering
- Efficient state updates
- Minimal re-renders

### Bundle Size
- Tree-shakeable imports
- Code splitting for large components
- Optimized icon usage

## Future Enhancements

### Planned Features
- [ ] Animation transitions
- [ ] Advanced form validation
- [ ] Real-time collaboration
- [ ] Advanced security features
- [ ] Custom theme support

### Accessibility Improvements
- [ ] Voice navigation support
- [ ] High contrast mode
- [ ] Reduced motion support
- [ ] Advanced keyboard shortcuts

## Testing Strategy

### Unit Tests
- Component rendering
- State management
- User interactions
- Accessibility features

### Integration Tests
- Navigation flow
- Form submissions
- Modal interactions
- Responsive behavior

### Visual Regression Tests
- Layout consistency
- Responsive breakpoints
- Theme variations
- Component states

## Conclusion

The new settings layout successfully replicates the structure and positioning from the reference screenshot while maintaining modern design principles and accessibility standards. The implementation provides both modal and traditional layout options, ensuring flexibility for different use cases and user preferences. 