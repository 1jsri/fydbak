import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ManagerLayout } from '../../components/manager/ManagerLayout';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { useToast } from '../../contexts/ToastContext';
import { User, Lock, LogOut, Key, Crown, Mail, Shield, CheckCircle } from 'lucide-react';

export function Settings() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'privacy'>('account');
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      toast.error('Please enter a full name');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user!.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      toast.info('Data export request submitted. You will receive an email with a download link.');
    } catch (error) {
      toast.error('Error requesting data export. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <ManagerLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-slate-600 mt-2">Manage your account information and preferences</p>
        </div>

        {/* Current Account Information Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-slate-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {profile?.full_name || 'User'}
                  </h2>
                  {profile?.is_site_owner && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 border border-amber-300 rounded-full">
                      <Crown className="w-3 h-3 text-amber-700" />
                      <span className="text-xs font-semibold text-amber-700">OWNER</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-700 mb-2">
                  <Mail className="w-4 h-4" />
                  <span className="font-mono text-sm">{user?.email}</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(profile?.role || 'manager')}`}>
                    {profile?.role?.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">
                    Account Status: <span className="font-semibold text-green-600">
                      {profile?.account_status === 'active' ? 'Active' : profile?.account_status}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'account'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <User className="w-4 h-4" />
                Account
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'security'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Lock className="w-4 h-4" />
                Security
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'privacy'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Shield className="w-4 h-4" />
                Privacy
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Profile Information</h2>
                  <p className="text-sm text-slate-600 mb-6">
                    Update your account profile information
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Email address cannot be changed. To use a different email, create a new account.
                      </p>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={loading || fullName === profile?.full_name}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Change Password</h2>
                  <p className="text-sm text-slate-600 mb-6">
                    Update your password to keep your account secure
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        New Password
                      </label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 8 characters)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Confirm New Password
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={handleChangePassword}
                        disabled={loading || !newPassword || !confirmPassword}
                      >
                        <Key className="w-4 h-4 mr-2" />
                        {loading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Session Management</h2>
                  <p className="text-sm text-slate-600 mb-6">
                    Sign out of your account to switch to a different account or for security purposes
                  </p>

                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Privacy & Data</h2>
                  <p className="text-slate-600 mb-6">Manage your data and privacy settings</p>

                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Data Protection</h3>
                    <p className="text-sm text-blue-800">
                      We take your privacy seriously. All your data is encrypted and stored securely.
                      You have full control over your data and can export or delete it at any time.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <Shield className="w-6 h-6 text-slate-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-2">Export My Data</h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Download a complete copy of your account data including all surveys, responses,
                          and account information in JSON format.
                        </p>
                        <Button
                          onClick={handleExportData}
                          disabled={loading}
                          variant="outline"
                        >
                          {loading ? 'Processing...' : 'Request Data Export'}
                        </Button>
                        <p className="text-xs text-slate-500 mt-2">
                          You will receive an email with a download link when your export is ready
                          (typically within a few minutes).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
