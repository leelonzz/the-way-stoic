import React from 'react';
import { User, Palette, Bell, Settings } from 'lucide-react';

type SettingsSection = 'account' | 'preferences' | 'appearance' | 'notifications';

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

const settingsNavigation = [
  {
    id: 'account' as const,
    name: 'Account',
    description: 'Profile and security settings',
    icon: User
  },
  {
    id: 'preferences' as const,
    name: 'Preferences',
    description: 'Personal customization options',
    icon: Settings
  },
  {
    id: 'appearance' as const,
    name: 'Appearance',
    description: 'Theme and display settings',
    icon: Palette
  },
  {
    id: 'notifications' as const,
    name: 'Notifications',
    description: 'Email and push preferences',
    icon: Bell
  }
];

export function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
  return (
    <div className="bg-white/40 rounded-xl border border-stone/5 p-6 shadow-sm">
      <div className="space-y-2">
        {settingsNavigation.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full text-left p-4 rounded-lg transition-all duration-200 group
                ${isActive 
                  ? 'bg-cta text-white shadow-sm' 
                  : 'text-stone/80 hover:bg-white/60 hover:text-ink'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <Icon 
                  size={20} 
                  className={`mt-1 ${isActive ? 'text-white' : 'text-stone/60 group-hover:text-ink'}`} 
                />
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-base ${isActive ? 'text-white' : 'text-ink'}`}>
                    {item.name}
                  </div>
                  <div className={`text-sm mt-1 leading-relaxed ${
                    isActive ? 'text-white/90' : 'text-stone/60 group-hover:text-stone/80'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}