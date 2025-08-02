import React from 'react';
import { SeekWisdomCard } from '@/components/ui/seek-wisdom-card';
import { SeekWisdomCardAlt } from '@/components/ui/seek-wisdom-card-alt';

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
        <div className="flex space-x-8 items-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-stone mb-4">Original Design</h3>
            <SeekWisdomCard onChatClick={handleChatClick} />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-stone mb-4">Screenshot Match</h3>
            <SeekWisdomCardAlt onChatClick={handleChatClick} />
          </div>
        </div>
        
        {/* Size variations */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-stone mb-4">Size Variations</h3>
          <div className="flex space-x-4 justify-center">
            <SeekWisdomCardAlt 
              onChatClick={handleChatClick} 
              className="w-48 h-64" 
            />
            <SeekWisdomCardAlt 
              onChatClick={handleChatClick} 
              className="w-56 h-72" 
            />
            <SeekWisdomCardAlt 
              onChatClick={handleChatClick} 
              className="w-72 h-96" 
            />
          </div>
        </div>
        
        <p className="text-sage text-center max-w-md">
          Click the "Chat" button to start a conversation with our philosophical mentors 
          and gain wisdom from ancient Stoic teachings.
        </p>
      </div>
    </div>
  );
}
