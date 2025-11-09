import React, { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Switch } from '@repo/ui/switch';
import type { User } from '../App';
import { ArrowLeft, User as UserIcon, Key, Globe, LogOut, MoonStar } from 'lucide-react';
import { ThemeToggle } from '@repo/ui/ThemeToggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { useUserPrefs } from '../../context/user-prefs';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  onBack: () => void;
}

export function Profile({ user, onLogout, onBack }: ProfileProps) {
  const { fontScale, setFontScale } = useUserPrefs();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isRTL, setIsRTL] = useState(false);

  const PasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  }).refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

  const passwordForm = useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const { control, handleSubmit, formState, reset } = passwordForm;

  const handlePasswordChange = handleSubmit(() => {
    alert('Password changed successfully');
    setShowPasswordForm(false);
    reset();
  });

  const handleLanguageToggle = (checked: boolean) => {
    setIsRTL(checked);
    // Apply RTL to document
    if (checked) {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3 mb-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl">Profile & Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input 
                value={user.username} 
                readOnly 
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input 
                value={user.role} 
                readOnly 
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MoonStar className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">Switch between light and dark mode.</p>
              </div>
              <ThemeToggle />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Font Size</p>
                <p className="text-sm text-muted-foreground">Choose Medium or Large text for task cards and UI.</p>
              </div>
              <div className="w-[200px]">
                <Select value={fontScale} onValueChange={(v) => setFontScale((v as 'md' | 'lg') || 'md')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showPasswordForm ? (
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordForm(true)}
                className="w-full"
              >
                Change Password
              </Button>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Controller
                    control={control}
                    name="currentPassword"
                    render={({ field }) => (
                      <Input id="currentPassword" type="password" {...field} />
                    )}
                  />
                  {formState.errors.currentPassword && (
                    <p className="text-xs text-destructive">{formState.errors.currentPassword.message as any}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Controller
                    control={control}
                    name="newPassword"
                    render={({ field }) => (
                      <Input id="newPassword" type="password" {...field} />
                    )}
                  />
                  {formState.errors.newPassword && (
                    <p className="text-xs text-destructive">{formState.errors.newPassword.message as any}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <Input id="confirmPassword" type="password" {...field} />
                    )}
                  />
                  {formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">{formState.errors.confirmPassword.message as any}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPasswordForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Update Password
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Arabic (RTL)</Label>
                <p className="text-sm text-muted-foreground">
                  Switch to Arabic with right-to-left layout
                </p>
              </div>
              <Switch
                checked={isRTL}
                onCheckedChange={handleLanguageToggle}
              />
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                {isRTL ? 'العربية - التخطيط من اليمين إلى اليسار' : 'English - Left to Right Layout'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Technician Console v1.0
              </p>
              <p className="text-xs text-muted-foreground">
                Task Management System
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="destructive" 
          onClick={onLogout}
          className="w-full h-12"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
