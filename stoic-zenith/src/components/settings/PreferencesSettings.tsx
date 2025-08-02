import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Clock, Calendar, Bell } from 'lucide-react';

export function PreferencesSettings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-ink mb-2">Preferences</h2>
        <p className="text-stone/70">Customize your experience and notification settings</p>
      </div>

      {/* Language & Time */}
      <Card className="border-stone/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5" />
            Language & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select defaultValue="en">
              <SelectTrigger className="bg-white/70">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (US)</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-stone/60">
              Change the language used in the user interface
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select defaultValue="auto">
              <SelectTrigger className="bg-white/70">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automatic (GMT+7:00) Saigon</SelectItem>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="est">Eastern Time (US)</SelectItem>
                <SelectItem value="pst">Pacific Time (US)</SelectItem>
                <SelectItem value="gmt">Greenwich Mean Time</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-stone/60">
              Current timezone setting for reminders and notifications
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="week-start">Start week on Monday</Label>
              <p className="text-xs text-stone/60">
                This will change how all calendars in your app look
              </p>
            </div>
            <Switch id="week-start" />
          </div>
        </CardContent>
      </Card>

      {/* Journal Settings */}
      <Card className="border-stone/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            Journal & Reflection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="daily-reminder">Daily reflection reminder</Label>
              <p className="text-xs text-stone/60">
                Get reminded to write in your journal every day
              </p>
            </div>
            <Switch id="daily-reminder" defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-time">Reminder time</Label>
            <Select defaultValue="20:00">
              <SelectTrigger className="bg-white/70">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="06:00">6:00 AM</SelectItem>
                <SelectItem value="08:00">8:00 AM</SelectItem>
                <SelectItem value="12:00">12:00 PM</SelectItem>
                <SelectItem value="18:00">6:00 PM</SelectItem>
                <SelectItem value="20:00">8:00 PM</SelectItem>
                <SelectItem value="22:00">10:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-save">Auto-save drafts</Label>
              <p className="text-xs text-stone/60">
                Automatically save your journal entries as you write
              </p>
            </div>
            <Switch id="auto-save" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-stone/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email notifications</Label>
              <p className="text-xs text-stone/60">
                Receive important updates and reminders via email
              </p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="quote-notifications">Daily quote notifications</Label>
              <p className="text-xs text-stone/60">
                Get a stoic quote delivered to your inbox each morning
              </p>
            </div>
            <Switch id="quote-notifications" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="progress-updates">Weekly progress updates</Label>
              <p className="text-xs text-stone/60">
                Receive a summary of your weekly reflection progress
              </p>
            </div>
            <Switch id="progress-updates" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="border-stone/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            Privacy & Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics">Help improve the app</Label>
              <p className="text-xs text-stone/60">
                Share anonymous usage data to help us improve your experience
              </p>
            </div>
            <Switch id="analytics" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="crash-reports">Automatic crash reports</Label>
              <p className="text-xs text-stone/60">
                Send crash reports to help us fix bugs and improve stability
              </p>
            </div>
            <Switch id="crash-reports" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button className="bg-cta hover:bg-cta/90">
          Save Preferences
        </Button>
      </div>
    </div>
  );
}