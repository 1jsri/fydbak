import { useEffect, useState } from 'react';
import { User, Lock, Bell, Shield, Download, Trash2, Save, AlertCircle, Check } from 'lucide-react';
import { ManagerLayout } from '../../components/manager/ManagerLayout';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { TextArea } from '../../components/shared/TextArea';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import type { UserPreferences } from '../../types';

type SettingsTab = 'profile' | 'security' | 'preferences' | 'privacy';

interface ProfileForm {
  full_name: string;
  email: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PreferencesForm {
  email_on_response: boolean;
  email_on_usage_alert: boolean;
  email_on_product_updates: boolean;
  digest_frequency: 'daily' | 'weekly' | 'never';
  language: string;
  timezone: string;
  default_survey_duration_type: 'hours' | 'days' | 'indefinite';
}

export function Settings() {
  const { user, profile } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: '',
    email: '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferencesForm, setPreferencesForm] = useState<PreferencesForm>({
    email_on_response: true,
    email_on_usage_alert: true,
    email_on_product_updates: false,
    digest_frequency: 'weekly',
    language: 'en',
    timezone: 'UTC',
    default_survey_duration_type: 'indefinite',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletionReason, setDeletionReason] = useState('');

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        email: profile.email,
      });
      loadPreferences();
    }
  }, [profile]);

  async function loadPreferences() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences(data);
        setPreferencesForm({
          email_on_response: data.email_on_response,
          email_on_usage_alert: data.email_on_usage_alert,
          email_on_product_updates: data.email_on_product_updates,
          digest_frequency: data.digest_frequency,
          language: data.language,
          timezone: data.timezone,
          default_survey_duration_type: data.default_survey_duration_type,
        });
      } else {
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load preferences');
    }
  }

  async function createDefaultPreferences() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error creating preferences:', error);
    }
  }

  async function updateProfile() {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  async function changePassword() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  async function updatePreferences() {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update(preferencesForm)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Preferences updated successfully');
      loadPreferences();
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  }

  async function exportMyData() {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('data_export_requests')
        .insert({
          user_id: user.id,
          requested_by: user.id,
          request_type: 'self',
          export_format: 'json',
        });

      if (error) throw error;

      toast.success('Export request created successfully');
      toast.info('You will receive an email with the download link when processing is complete');
    } catch (error) {
      console.error('Error creating export request:', error);
      toast.error('Failed to create export request');
    } finally {
      setLoading(false);
    }
  }

  async function deleteAccount() {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .insert({
          user_id: user.id,
          requested_by: user.id,
          request_type: 'self',
          status: 'scheduled',
          scheduled_deletion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          deletion_reason: deletionReason || 'User requested deletion',
        });

      if (error) throw error;

      toast.success('Account deletion scheduled for 30 days from now');
      toast.info('You can cancel this request by contacting support within 30 days');
      setShowDeleteModal(false);
      setDeleteConfirmText('');
      setDeletionReason('');
    } catch (error) {
      console.error('Error scheduling deletion:', error);
      toast.error('Failed to schedule deletion');
    } finally {
      setLoading(false);
    }
  }

  function getPasswordStrength(password: string): { strength: number; label: string; color: string } {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 10) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
    if (password.length < 14) return { strength: 75, label: 'Good', color: 'bg-blue-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  }

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Account Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
  ];

  return (
    <ManagerLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="lg:col-span-3 p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Profile Information</h2>
                  <p className="text-sm text-slate-600 mb-6">
                    Update your account profile information
                  </p>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                    {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{profile?.full_name || 'No name'}</h3>
                    <p className="text-sm text-slate-600">{profile?.email}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Member since {profile ? new Date(profile.created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      value={profileForm.email}
                      disabled
                      className="bg-slate-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Email is linked to your authentication and cannot be changed here
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button onClick={updateProfile} disabled={loading}>
                      {loading ? (
                        'Saving...'
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Account Security</h2>
                  <p className="text-sm text-slate-600 mb-6">
                    Manage your password and security settings
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                    {passwordForm.newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-600">Password Strength:</span>
                          <span className={`font-medium ${
                            passwordStrength.strength === 100 ? 'text-green-600' :
                            passwordStrength.strength >= 75 ? 'text-blue-600' :
                            passwordStrength.strength >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${passwordStrength.color}`}
                            style={{ width: `${passwordStrength.strength}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Passwords do not match
                      </p>
                    )}
                    {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Passwords match
                      </p>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button onClick={changePassword} disabled={loading}>
                      {loading ? (
                        'Changing Password...'
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6 mt-8">
                  <h3 className="font-medium text-slate-900 mb-3">Security Information</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span>Last Login:</span>
                      <span className="font-medium">
                        {profile?.last_login_at ? new Date(profile.last_login_at).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span>Account Status:</span>
                      <span className={`font-medium capitalize ${
                        profile?.account_status === 'active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {profile?.account_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Preferences</h2>
                  <p className="text-sm text-slate-600 mb-6">
                    Customize your experience and notifications
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-slate-900 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                        <div>
                          <div className="font-medium text-slate-900">Survey Responses</div>
                          <div className="text-sm text-slate-600">Get notified when someone completes a survey</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferencesForm.email_on_response}
                          onChange={(e) => setPreferencesForm({ ...preferencesForm, email_on_response: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                        <div>
                          <div className="font-medium text-slate-900">Usage Alerts</div>
                          <div className="text-sm text-slate-600">Receive alerts about usage limits and quotas</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferencesForm.email_on_usage_alert}
                          onChange={(e) => setPreferencesForm({ ...preferencesForm, email_on_usage_alert: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                        <div>
                          <div className="font-medium text-slate-900">Product Updates</div>
                          <div className="text-sm text-slate-600">Stay informed about new features and improvements</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferencesForm.email_on_product_updates}
                          onChange={(e) => setPreferencesForm({ ...preferencesForm, email_on_product_updates: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Digest Frequency
                    </label>
                    <select
                      value={preferencesForm.digest_frequency}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, digest_frequency: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Digest</option>
                      <option value="never">Never (Individual Emails Only)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose how often to receive summary emails of your activity
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-900 mb-4">Default Survey Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Default Duration Type
                        </label>
                        <select
                          value={preferencesForm.default_survey_duration_type}
                          onChange={(e) => setPreferencesForm({ ...preferencesForm, default_survey_duration_type: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                          <option value="indefinite">Indefinite</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                          Surveys will default to this duration when creating new ones
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={updatePreferences} disabled={loading}>
                      {loading ? (
                        'Saving...'
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Privacy & Data</h2>
                  <p className="text-sm text-slate-600 mb-6">
                    Manage your data and privacy settings
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Data Protection</h3>
                    <p className="text-sm text-blue-800">
                      We take your privacy seriously. All your data is encrypted and stored securely.
                      You have full control over your data and can export or delete it at any time.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-6">
                    <h3 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Export My Data
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Download a complete copy of your account data including all surveys, responses, and account information in JSON format.
                    </p>
                    <Button variant="outline" onClick={exportMyData} disabled={loading}>
                      {loading ? 'Creating Export...' : 'Request Data Export'}
                    </Button>
                    <p className="text-xs text-slate-500 mt-2">
                      You will receive an email with a download link when your export is ready (typically within a few minutes).
                    </p>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-medium text-red-600 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Danger Zone
                    </h3>

                    <div className="border border-red-200 bg-red-50 rounded-lg p-6">
                      <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                      <p className="text-sm text-red-800 mb-4">
                        Permanently delete your account and all associated data. This action will schedule your account for deletion in 30 days,
                        giving you time to change your mind. After 30 days, all data will be permanently deleted and cannot be recovered.
                      </p>
                      <Button
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-100"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete My Account
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-900 mb-3">Privacy Links</h3>
                    <div className="space-y-2 text-sm">
                      <a href="/privacy" className="text-blue-600 hover:underline block">
                        Privacy Policy
                      </a>
                      <a href="/terms" className="text-blue-600 hover:underline block">
                        Terms of Service
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmText('');
          setDeletionReason('');
        }}
        onConfirm={deleteAccount}
        title="Delete Account"
        message="This action will schedule your account for permanent deletion in 30 days. During this grace period, you can contact support to restore your account. After 30 days, all your data will be permanently deleted and cannot be recovered."
        confirmText="Schedule Deletion"
        variant="danger"
      >
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Why are you leaving? (optional)
            </label>
            <TextArea
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              placeholder="Help us improve by telling us why you're leaving..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type <span className="font-bold">DELETE</span> to confirm
            </label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
        </div>
      </ConfirmModal>
    </ManagerLayout>
  );
}
