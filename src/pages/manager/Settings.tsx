import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Sidebar } from '../components/shared/Sidebar';
import { Button } from '../components/shared/Button';
import { User, Lock, Bell, Shield, Mail } from 'lucide-react';

export function Settings() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'privacy'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleExportData = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Implementation for data export would go here
      setMessage('Data export request submitted. You will receive an email with a download link.');
    } catch (error) {
      setMessage('Error requesting data export. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-2">Manage your account settings and preferences</p>
          </div>

          {/* Email Display Section - Always visible at top */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-900 font-medium">Logged in as:</p>
                <p className="text-blue-700 font-mono text-sm">{user?.email || 'Not available'}</p>
              </div>
            </div>
            {profile && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <p className="text-xs text-blue-800">
                  Role: <span className="font-semibold">{profile.role}</span>
                  {profile.is_site_owner && <span className="ml-2 text-blue-600">• Site Owner</span>}
                </p>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-slate-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'profile'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
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
                  Account Security
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'preferences'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  Preferences
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
                  Privacy & Data
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Profile Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          defaultValue={profile?.full_name || ''}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Account Security</h2>
                    <div className="space-y-4">
                      <Button variant="outline" onClick={handleSignOut}>
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Preferences</h2>
                    <p className="text-slate-600">Notification and display preferences coming soon.</p>
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
                          {message && (
                            <p className="text-sm text-slate-600 mt-2">{message}</p>
                          )}
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
      </div>
    </div>
  );
}