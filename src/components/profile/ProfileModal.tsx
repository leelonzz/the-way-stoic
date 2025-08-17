'use client';

import React, { useState } from 'react';
import { Settings, Bell, Link, Zap, Check, Star, CreditCard } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { DodoSubscriptionButton } from '@/components/subscription/DodoSubscriptionButton';
import { SubscriptionManagement } from '@/components/subscription/SubscriptionManagement';
import { getEffectiveSubscriptionPlan } from '@/utils/subscription';
import { JournalSecuritySection } from './JournalSecuritySection';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type NavigationSection = 'account' | 'preferences' | 'notifications' | 'connections' | 'subscription' | 'upgrade';

export function ProfileModal({ isOpen, onClose }: ProfileModalProps): JSX.Element | null {
  const { user, profile, signOut } = useAuthContext();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeSection, setActiveSection] = useState<NavigationSection>('account');

  if (!user) {
    return null;
  }

  const handleSignOut = async (): Promise<void> => {
    setIsSigningOut(true);
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getUserInitials = (): string => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = (): string => {
    return profile?.full_name || user.email?.split('@')[0] || 'User';
  };

  const navigationItems = [
    {
      id: 'account' as const,
      name: 'Account',
      icon: null,
      isUserSection: true
    },
    {
      id: 'preferences' as const,
      name: 'Preferences',
      icon: Settings,
      isUserSection: true
    },
    {
      id: 'notifications' as const,
      name: 'Notifications',
      icon: Bell,
      isUserSection: true
    },
    {
      id: 'connections' as const,
      name: 'Connections',
      icon: Link,
      isUserSection: true
    },
    {
      id: 'subscription' as const,
      name: 'Subscription',
      icon: CreditCard,
      isUserSection: true
    },
    {
      id: 'upgrade' as const,
      name: 'Upgrade plan',
      icon: Zap,
      isUserSection: true,
      isSpecial: true
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-parchment">
        <div className="flex h-[600px]">
          {/* Left Navigation Sidebar */}
          <div className="w-64 bg-parchment border-r border-stone/20 p-4">
            <div className="space-y-6">
              {/* User Section */}
              <div className="space-y-1">
                {navigationItems.filter(item => item.isUserSection).map((item) => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;
                  
                  if (item.id === 'account') {
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          isActive ? 'bg-stone/20 text-ink' : 'text-stone hover:bg-stone/10'
                        }`}
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarImage 
                            src={profile?.avatar_url || undefined} 
                            alt={getDisplayName()}
                          />
                          <AvatarFallback className="bg-stone/30 text-ink text-xs">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{getDisplayName()}</span>
                      </button>
                    );
                  }
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isActive ? 'bg-stone/20 text-ink' : 'text-stone hover:bg-stone/10'
                      } ${item.isSpecial ? 'text-cta' : ''}`}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      <span className="text-sm">{item.name}</span>
                      {item.isSpecial && (
                        <div className="ml-auto w-2 h-2 bg-cta rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>



              {/* Refer a friend */}
              <div className="border-t border-stone/20 pt-4">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-stone hover:bg-stone/10 rounded-lg transition-colors">
                  <div className="w-4 h-4 flex items-center justify-center">♥</div>
                  <span className="text-sm">Refer a friend</span>
                </button>
              </div>

              {/* Sign Out */}
              <div className="border-t border-stone/20 pt-4">
                <button 
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <span className="text-sm">{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="p-8">
              {activeSection === 'account' && (
                <>
                  <div className="mb-8">
                    <h1 className="text-2xl font-serif font-semibold text-ink mb-2">Account</h1>
                  </div>

                  <div className="space-y-8">
                    {/* Profile Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage 
                            src={profile?.avatar_url || undefined} 
                            alt={getDisplayName()}
                          />
                          <AvatarFallback className="bg-stone/20 text-ink text-lg font-semibold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm text-stone mb-1">Preferred name</div>
                          <div className="bg-parchment px-3 py-2 rounded border border-stone/20 text-ink font-medium">
                            {getDisplayName()}
                          </div>
                          <button className="text-sm text-cta hover:text-cta/80 mt-2">
                            Create your portrait
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Account Security Section */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-serif font-semibold text-ink">Account security</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-4">
                          <div>
                            <div className="text-sm text-stone mb-1">Email</div>
                            <div className="text-sm text-ink">{profile?.email || user.email}</div>
                          </div>
                          <Button variant="outline" size="sm" className="text-sm border-stone/30 text-ink hover:bg-stone/5">
                            Change email
                          </Button>
                        </div>

                      </div>
                    </div>

                  </div>
                </>
              )}

              {activeSection === 'upgrade' && (
                <div className="space-y-8">
                  <div className="mb-8">
                    <h1 className="text-2xl font-serif font-semibold text-ink mb-2">Upgrade Plan</h1>
                    <p className="text-stone">Choose your philosophical path and unlock the full power of stoic wisdom.</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {(() => {
                      const effectivePlan = getEffectiveSubscriptionPlan(profile);
                      return [
                        {
                          name: 'Seeker',
                          price: 'Free',
                          period: '',
                          description: 'Perfect for beginning your stoic journey',
                          features: [
                            'Unlimited journal entries',
                            'Quote library & saving',
                            'Memento mori calendar',
                            'Daily stoic quotes',
                            'Basic streak tracking',
                            'Daily journal prompts',
                          ],
                          cta: effectivePlan === 'seeker' ? 'Current Plan' : 'Downgrade',
                          popular: false,
                          current: effectivePlan === 'seeker',
                        },
                        {
                          name: 'Philosopher',
                          price: '$14',
                          period: 'per month',
                          description: 'For dedicated practitioners of stoic wisdom',
                          features: [
                            'Everything in Free',
                            'Unlimited chat with philosopher',
                            'Course (coming soon)',
                            'Priority support',
                            'Advanced streak analytics',
                            'Personalized insights',
                            'Export journal entries',
                          ],
                          cta: effectivePlan === 'philosopher' ? 'Current Plan' : 'Begin Practice',
                          popular: true,
                          current: effectivePlan === 'philosopher',
                        },
                      ];
                    })().map((plan, index) => (
                      <Card
                        key={index}
                        className={`relative overflow-hidden transition-all duration-300 ${
                          plan.popular
                            ? 'border-cta/50 shadow-lg'
                            : 'border-stone/20'
                        } ${plan.current ? 'border-stone/40' : ''}`}
                      >
                        {plan.popular && (
                          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-cta to-cta/80 text-white text-center py-2 text-sm font-medium">
                            <Star className="inline h-4 w-4 mr-1 text-white" />
                            Most Popular
                          </div>
                        )}

                        <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                          <div className="space-y-2">
                            <CardTitle className="text-xl text-ink">
                              {plan.name}
                            </CardTitle>
                            <div className="flex items-baseline justify-center space-x-1">
                              <span className="text-3xl font-bold text-ink">
                                {plan.price}
                              </span>
                              {plan.period && (
                                <span className="text-stone text-sm">/{plan.period}</span>
                              )}
                            </div>
                            <CardDescription className="text-stone text-sm">
                              {plan.description}
                            </CardDescription>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                          <ul className="space-y-2">
                            {plan.features.map((feature, featureIndex) => (
                              <li
                                key={featureIndex}
                                className="flex items-start space-x-3"
                              >
                                <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-cta" />
                                <span className="text-stone text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>

{plan.name === 'Philosopher' && !plan.current ? (
                            <DodoSubscriptionButton
                              productId="pdt_1xvwazO5L41SzZeMegxyk"
                              productName="The Stoic Way"
                              onSuccess={(subscriptionId) => {
                                console.log('Subscription successful:', subscriptionId);
                                // Handle successful subscription
                              }}
                              onError={(error) => {
                                console.error('Subscription error:', error);
                                // Handle subscription error
                              }}
                            />
                          ) : (
                            <Button
                              disabled={plan.current}
                              className={`w-full ${
                                plan.current
                                  ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200'
                                  : plan.name === 'Philosopher'
                                  ? 'bg-cta hover:bg-cta/90 text-white'
                                  : 'bg-stone/10 hover:bg-stone/20 text-stone border border-stone/30'
                              }`}
                              size="lg"
                            >
                              {plan.current && (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              {plan.cta}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'subscription' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-serif font-semibold text-ink">Subscription Management</h1>
                  <SubscriptionManagement userId={user.id} />
                </div>
              )}

              {activeSection === 'preferences' && (
                <div className="space-y-8">
                  <div className="mb-8">
                    <h1 className="text-2xl font-serif font-semibold text-ink mb-2">Preferences</h1>
                    <p className="text-stone">Manage your account preferences and security settings.</p>
                  </div>

                  <JournalSecuritySection />
                </div>
              )}

              {activeSection !== 'account' && activeSection !== 'upgrade' && activeSection !== 'subscription' && activeSection !== 'preferences' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-serif font-semibold text-ink capitalize">{activeSection.replace('-', ' ')}</h1>
                  <div className="bg-parchment rounded-lg p-6 border border-stone/20">
                    <p className="text-stone">This section is not yet implemented.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}