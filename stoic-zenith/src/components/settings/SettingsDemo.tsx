import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsModal } from './SettingsModal';

export function SettingsDemo(): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockProfile = {
    name: 'Lee',
    email: 'leenhatlong210@gmail.com',
    avatar: undefined
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Settings Layout Demo</h1>
          <p className="text-muted-foreground text-lg">
            This demonstrates the new settings modal layout based on the provided screenshot structure.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="gap-2"
          >
            <Settings className="h-5 w-5" />
            Open Settings Modal
          </Button>

          <div className="text-sm text-muted-foreground">
            Click the button above to see the settings modal with the two-column layout
          </div>
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg text-left">
          <h2 className="text-xl font-semibold mb-4">Layout Features</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Two-column layout: Left navigation (30%) + Right content (70%)</li>
            <li>• Modal overlay with proper backdrop and positioning</li>
            <li>• Grouped navigation with Account, Workspace, and Other sections</li>
            <li>• Account section with profile, security, and support subsections</li>
            <li>• Proper spacing and alignment matching the screenshot</li>
            <li>• Responsive design with overflow handling</li>
            <li>• Interactive elements with proper hover states</li>
          </ul>
        </div>
      </div>

      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={mockProfile}
      />
    </div>
  );
} 