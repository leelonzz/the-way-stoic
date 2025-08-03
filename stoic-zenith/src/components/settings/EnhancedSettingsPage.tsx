import React, { useState } from 'react';
import { Settings, X, User, Bell, Users, Sparkles, Globe, Link, Download, ArrowUp, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SettingsSection = 'account' | 'preferences' | 'notifications' | 'connections' | 'workspace' | 'ai' | 'public' | 'emoji' | 'import';
type LayoutMode = 'traditional' | 'modal';

interface EnhancedSettingsPageProps {
  profile?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const settingsNavigation = [
  {
    group: 'Account',
    items: [
      { id: 'account' as const, name: 'Account', icon: User, isSelected: true },
      { id: 'preferences' as const, name: 'Preferences', icon: Settings },
      { id: 'notifications' as const, name: 'Notifications', icon: Bell },
      { id: 'connections' as const, name: 'Connections', icon: Link },
    ]
  },
  {
    group: 'Workspace',
    items: [
      { id: 'workspace' as const, name: 'General', icon: Settings },
      { id: 'workspace' as const, name: 'People', icon: Users },
      { id: 'workspace' as const, name: 'Teamspaces', icon: Users },
    ]
  },
  {
    group: 'Other',
    items: [
      { id: 'ai' as const, name: 'Notion AI', icon: Sparkles, badge: 'New' },
      { id: 'public' as const, name: 'Public pages', icon: Globe },
      { id: 'emoji' as const, name: 'Emoji', icon: Globe },
      { id: 'connections' as const, name: 'Connections', icon: Link },
      { id: 'import' as const, name: 'Import', icon: Download },
    ]
  }
];

export function EnhancedSettingsPage({ profile }: EnhancedSettingsPageProps): JSX.Element {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('traditional');
  const [preferredName, setPreferredName] = useState(profile?.name || '');
  const [supportAccess, setSupportAccess] = useState(false);

  const renderAccountContent = (): JSX.Element => (
    <div className="space-y-8">
      {/* Account Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Account</h3>
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile?.avatar} />
            <AvatarFallback className="text-lg">
              {profile?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preferred-name">Preferred name</Label>
              <Input
                id="preferred-name"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                placeholder="Enter your preferred name"
              />
            </div>
            <Button variant="link" className="p-0 h-auto text-sm">
              Create your portrait
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Account Security Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Account security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div className="space-y-1">
              <div className="font-medium">Email</div>
              <div className="text-sm text-muted-foreground">{profile?.email}</div>
            </div>
            <Button variant="outline" size="sm">
              Change email
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="space-y-1">
              <div className="font-medium">Password</div>
              <div className="text-sm text-muted-foreground">
                Set a permanent password to login to your account.
              </div>
            </div>
            <Button variant="outline" size="sm">
              Add password
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="space-y-1">
              <div className="font-medium">2-step verification</div>
              <div className="text-sm text-muted-foreground">
                Add an additional layer of security to your account during login.
              </div>
            </div>
            <Button variant="outline" size="sm">
              Add verification method
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="space-y-1">
              <div className="font-medium">Passkeys</div>
              <div className="text-sm text-muted-foreground">
                Securely sign-in with on-device biometric authentication.
              </div>
            </div>
            <Button variant="outline" size="sm">
              Add passkey
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Support Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Support</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div className="space-y-1">
              <div className="font-medium">Support access</div>
              <div className="text-sm text-muted-foreground">
                Grant Notion support temporary access to your account so we can troubleshoot problems or recover content on your behalf. You can revoke access at any time.
              </div>
            </div>
            <Switch
              checked={supportAccess}
              onCheckedChange={setSupportAccess}
            />
          </div>

          <Button variant="destructive" className="text-red-600 hover:text-red-700">
            Delete my account
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = (): JSX.Element => {
    switch (activeSection) {
      case 'account':
        return renderAccountContent();
      default:
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h3>
            <p className="text-muted-foreground">Settings for {activeSection} coming soon.</p>
          </div>
        );
    }
  };

  const renderNavigation = (): JSX.Element => (
    <div className="space-y-8">
      {settingsNavigation.map((group) => (
        <div key={group.group} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {group.group}
          </h3>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveSection(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'hover:bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Bottom Actions */}
      <div className="pt-6 space-y-3">
        <Button variant="ghost" className="w-full justify-start text-blue-600 hover:text-blue-700">
          <ArrowUp className="h-4 w-4 mr-3" />
          Upgrade plan
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Heart className="h-4 w-4 mr-3" />
          Refer a friend
        </Button>
      </div>
    </div>
  );

  if (layoutMode === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Account</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLayoutMode('traditional')}
              >
                Switch to Traditional
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Navigation */}
            <div className="w-80 border-r bg-gray-50/50 p-6 overflow-y-auto">
              {renderNavigation()}
            </div>

            {/* Right Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-ink mb-3">Settings</h1>
            <p className="text-stone/70 text-lg">Manage your account and preferences</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setLayoutMode('modal')}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Modal View
          </Button>
        </div>
      </div>

      <div className="flex gap-10 min-h-[600px]">
        <div className="w-80 flex-shrink-0">
          <Card className="bg-white/40 border-stone/5">
            <CardHeader>
              <CardTitle className="text-lg">Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              {renderNavigation()}
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <Card className="bg-white/30 border-stone/5 h-full">
            <CardContent className="p-6">
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 