import React from 'react';
// import { SeekWisdomCard } from '@/components/ui/seek-wisdom-card';
// import { SeekWisdomCardAlt } from '@/components/ui/seek-wisdom-card-alt';

export function SeekWisdomDemo() {
  const handleChatClick = () => {
    console.log('Starting wisdom chat...');
    // You can navigate to chat page or open chat interface
    // Example: router.push('/mentors') or open a modal
  };

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-4xl font-serif font-bold text-stone text-center mb-8">
          Seek Wisdom Card Designs
        </h1>
        
        {/* Both card variants side by side */}
        <div className="text-center text-stone-500">
          Components temporarily disabled for build fix
        </div>
        
        <p className="text-sage text-center max-w-md">
          Click the "Chat" button to start a conversation with our philosophical mentors 
          and gain wisdom from ancient Stoic teachings.
        </p>
      </div>
    </div>
  );
}
