# Seek Wisdom Card Components

This directory contains two variations of the "Seek Wisdom" card component that matches the design from your screenshot.

## Components

### 1. SeekWisdomCard (`seek-wisdom-card.tsx`)
The original design using your project's color palette (terra cotta theme).

### 2. SeekWisdomCardAlt (`seek-wisdom-card-alt.tsx`)  
Alternative design that more closely matches the screenshot's brown/amber color scheme.

## Usage

```tsx
import { SeekWisdomCard } from '@/components/ui/seek-wisdom-card';
import { SeekWisdomCardAlt } from '@/components/ui/seek-wisdom-card-alt';

function MyComponent() {
  const handleChatClick = () => {
    // Navigate to chat or open modal
    console.log('Starting wisdom chat...');
  };

  return (
    <div>
      {/* Default size */}
      <SeekWisdomCard onChatClick={handleChatClick} />
      
      {/* Custom size */}
      <SeekWisdomCardAlt 
        onChatClick={handleChatClick} 
        className="w-48 h-64" 
      />
    </div>
  );
}
```

## Props

Both components accept the same props:

- `onChatClick?: () => void` - Callback function when the Chat button is clicked
- `className?: string` - Additional CSS classes for customization

## Features

- **Responsive Design**: Cards adapt to different screen sizes
- **Hover Effects**: Subtle animations on hover (scale, shadow changes)
- **Accessibility**: Proper semantic HTML and focus states
- **Customizable**: Easy to modify colors, sizes, and styling
- **SVG Illustrations**: Scalable meditation person illustration

## Styling

The cards use:
- Tailwind CSS for styling
- CSS gradients for backgrounds
- SVG for the meditation person illustration
- Your project's design system colors

## Demo

Check out the demo component at `src/components/demo/seek-wisdom-demo.tsx` to see both variations in action.

## Color Schemes

### SeekWisdomCard
Uses your project's terra cotta palette:
- Background: Parchment to hero gradient
- Text: Stone color
- Button: Crail/Primary gradient

### SeekWisdomCardAlt  
Uses amber/brown tones to match the screenshot:
- Background: Amber-50 to orange-50 gradient
- Text: Amber-900
- Button: Amber-700/800

## Integration

These components integrate seamlessly with your existing:
- Card component system
- Button component
- Color palette
- Typography (serif fonts)
- Hover and transition effects
