import { useState } from 'react';
import SEO from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, updateNotificationPreferences, changePassword, deleteAccount } from '@/services/settingsService';
import type { NotificationPreferences } from '@/types/portal';
import { toast } from 'sonner';

export function SettingsPage() {
  const { client, user, refreshClient, logout } = useAuth();

  // Profile form state
  const [fullName, setFullName] = useState(client?.full_name || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [businessName, setBusinessName] = useState(client?.business_name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Notification preferences state
  const [notifications, setNotifications] = useState<NotificationPreferences>(
    client?.notification_preferences || {
      email_new_leads: true,
      email_lead_scored: true,
      email_weekly_digest: true,
      email_followup_sent: false,
    }
  );
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setIsSavingProfile(true);

    const result = await updateProfile(client.id, {
      full_name: fullName,
      phone,
      business_name: businessName,
    });

    if (result.success) {
      toast.success('Profile updated successfully');
      await refreshClient();
    } else {
      toast.error(result.error?.message || 'Failed to update profile');
    }

    setIsSavingProfile(false);
  };

  const handleSaveNotifications = async () => {
    if (!client) return;

    setIsSavingNotifications(true);

    const result = await updateNotificationPreferences(client.id, notifications);

    if (result.success) {
      toast.success('Notification preferences updated');
      await refreshClient();
    } else {
      toast.error(result.error?.message || 'Failed to update preferences');
    }

    setIsSavingNotifications(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);

    const result = await changePassword(newPassword);

    if (result.success) {
      toast.success('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(result.error?.message || 'Failed to change password');
    }

    setIsChangingPassword(false);
  };

  const handleDeleteAccount = async () => {
    if (!client || deleteConfirmText !== 'DELETE') return;

    setIsDeleting(true);

    const result = await deleteAccount(client.id);

    if (result.success) {
      toast.success('Account deleted');
      await logout();
    } else {
      toast.error(result.error?.message || 'Failed to delete account');
    }

    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <SEO
        title="Settings - Client Portal - Khanect AI"
        description="Manage your profile and preferences."
        noindex={true}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-gray-100 dark:bg-white/[0.06]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Profile Information
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Acme Inc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50 dark:bg-white/[0.02]"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Email Notifications
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">New Lead Alerts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified when a new lead comes in
                  </p>
                </div>
                <Switch
                  checked={notifications.email_new_leads}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email_new_leads: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Lead Scoring Updates</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Notify when leads are scored by AI
                  </p>
                </div>
                <Switch
                  checked={notifications.email_lead_scored}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email_lead_scored: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Weekly Digest</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Weekly summary of leads and activity
                  </p>
                </div>
                <Switch
                  checked={notifications.email_weekly_digest}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email_weekly_digest: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Follow-up Confirmations</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Confirm when automated emails are sent
                  </p>
                </div>
                <Switch
                  checked={notifications.email_followup_sent}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email_followup_sent: checked })
                  }
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications} disabled={isSavingNotifications}>
                  {isSavingNotifications ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            {/* Change Password */}
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Change Password
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isChangingPassword || !newPassword || !confirmPassword}>
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-white dark:bg-white/[0.03] border border-red-200 dark:border-red-500/20 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                Danger Zone
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently deactivate your account
              and remove access to all data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="deleteConfirm" className="text-sm">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </Label>
            <Input
              id="deleteConfirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
