import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Save, Eye, EyeOff, Trash2, User, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/hooks/useProfile';

interface AccountSettingsProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>) => Promise<boolean>;
  onUpdateEmail: (email: string) => Promise<boolean>;
  onUpdatePassword: (password: string) => Promise<boolean>;
  onDeleteAccount: () => Promise<boolean>;
}

export function AccountSettings({ 
  profile, 
  onUpdateProfile, 
  onUpdateEmail, 
  onUpdatePassword, 
  onDeleteAccount 
}: AccountSettingsProps) {
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [email, setEmail] = useState(profile.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('profile');
    
    try {
      const success = await onUpdateProfile({
        full_name: fullName.trim() || null,
        avatar_url: avatarUrl.trim() || null
      });
      
      if (success) {
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
      }
    } finally {
      setIsLoading(null);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === profile.email) return;
    
    setIsLoading('email');
    
    try {
      const success = await onUpdateEmail(email);
      if (success) {
        toast({
          title: "Email update initiated",
          description: "Check your new email address for confirmation.",
        });
      }
    } finally {
      setIsLoading(null);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both password fields match.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading('password');
    
    try {
      const success = await onUpdatePassword(newPassword);
      if (success) {
        setNewPassword('');
        setConfirmPassword('');
        toast({
          title: "Password updated",
          description: "Your password has been successfully changed.",
        });
      }
    } finally {
      setIsLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading('delete');
    
    try {
      const success = await onDeleteAccount();
      if (success) {
        toast({
          title: "Account deleted",
          description: "Your account has been permanently deleted.",
        });
      }
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-ink mb-3">Account Settings</h2>
        <p className="text-stone/60 text-base">Manage your profile, email, and security settings</p>
      </div>

      {/* Profile Information */}
      <Card className="border-stone/5 bg-white/40 shadow-none">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl font-medium">
            <User className="w-5 h-5 text-stone/70" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="fullName" className="text-sm font-medium text-stone/80">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-white/80 border-stone/10 focus:border-cta/30 h-11"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="avatarUrl" className="text-sm font-medium text-stone/80">Avatar URL</Label>
              <Input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="bg-white/80 border-stone/10 focus:border-cta/30 h-11"
              />
              <p className="text-sm text-stone/50">
                Enter a URL to your profile picture
              </p>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading === 'profile'}
              className="bg-cta hover:bg-cta/90 h-11 px-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading === 'profile' ? 'Saving...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="border-stone/5 bg-white/40 shadow-none">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl font-medium">
            <Mail className="w-5 h-5 text-stone/70" />
            Email Address
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleUpdateEmail} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-stone/80">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/80 border-stone/10 focus:border-cta/30 h-11"
                required
              />
              <p className="text-sm text-stone/50">
                You'll receive a confirmation email to verify the change
              </p>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading === 'email' || email === profile.email}
              variant="outline"
              className="h-11 px-6 border-stone/20 hover:bg-stone/5"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isLoading === 'email' ? 'Updating...' : 'Update Email'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card className="border-stone/5 bg-white/40 shadow-none">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl font-medium">
            <Lock className="w-5 h-5 text-stone/70" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="newPassword" className="text-sm font-medium text-stone/80">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="bg-white/80 border-stone/10 focus:border-cta/30 h-11 pr-12"
                  minLength={8}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-stone/50" /> : <Eye className="w-4 h-4 text-stone/50" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-stone/80">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-white/80 border-stone/10 focus:border-cta/30 h-11"
                minLength={8}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading === 'password' || !newPassword || !confirmPassword}
              variant="outline"
              className="h-11 px-6 border-stone/20 hover:bg-stone/5"
            >
              <Lock className="w-4 h-4 mr-2" />
              {isLoading === 'password' ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator className="my-10" />

      {/* Danger Zone */}
      <Card className="border-red-100 bg-red-50/30 shadow-none">
        <CardHeader className="pb-6">
          <CardTitle className="text-red-700 flex items-center gap-3 text-xl font-medium">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-red-700 text-base">Delete Account</h4>
              <p className="text-sm text-red-600/60 mt-2">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isLoading === 'delete'}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isLoading === 'delete' ? 'Deleting...' : 'Delete Account'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers, including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Your profile and preferences</li>
                      <li>Saved quotes and notes</li>
                      <li>Personal goals and progress</li>
                      <li>Life calendar data</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}