import { useEffect, useState } from 'react';
import { Search, Crown, TrendingUp, Zap, Calendar, Mail, User, Ban, CheckCircle, Download, Trash2, FileText, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { TextArea } from '../../components/shared/TextArea';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import type { Profile, AdminNote } from '../../types';

interface UserWithDetails extends Profile {
  surveys_count?: number;
}

interface NoteFormData {
  note_text: string;
  note_type: 'general' | 'support' | 'billing' | 'security' | 'other';
}

export function UserManagement() {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'activity' | 'data'>('overview');
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [noteForm, setNoteForm] = useState<NoteFormData>({ note_text: '', note_type: 'general' });
  const [confirmAction, setConfirmAction] = useState<{type: 'suspend' | 'unsuspend' | 'delete', userId: string} | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const toast = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, selectedPlan, selectedStatus, users]);

  useEffect(() => {
    if (selectedUser && activeTab === 'notes') {
      loadNotes(selectedUser.id);
    }
  }, [selectedUser, activeTab]);

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function loadNotes(userId: string) {
    try {
      const { data, error } = await supabase
        .from('admin_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setNotes(data);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load notes');
    }
  }

  function filterUsers() {
    let filtered = users;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        u =>
          u.email.toLowerCase().includes(term) ||
          u.full_name?.toLowerCase().includes(term)
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(u => u.account_status === selectedStatus);
    }

    if (selectedPlan !== 'all') {
      if (selectedPlan === 'trial') {
        filtered = filtered.filter(u => u.trial_active);
      } else {
        filtered = filtered.filter(u => u.current_plan === selectedPlan);
      }
    }

    setFilteredUsers(filtered);
  }

  async function changePlan(userId: string, newPlan: 'free' | 'pro' | 'pro_plus') {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          current_plan: newPlan,
          trial_active: false,
          trial_plan: null,
        })
        .eq('id', userId);

      if (error) throw error;

      await supabase.rpc('log_admin_action', {
        action_type_param: 'change_plan',
        target_user_id_param: userId,
        details_param: { new_plan: newPlan },
      });

      toast.success(`Plan changed to ${newPlan} successfully`);
      loadUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error('Failed to change plan');
    }
  }

  async function resetUsage(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ responses_used_this_month: 0 })
        .eq('id', userId);

      if (error) throw error;

      await supabase.rpc('log_admin_action', {
        action_type_param: 'reset_usage',
        target_user_id_param: userId,
        details_param: {},
      });

      toast.success('Usage reset successfully');
      loadUsers();
    } catch (error) {
      console.error('Error resetting usage:', error);
      toast.error('Failed to reset usage');
    }
  }

  async function suspendUser(userId: string, reason: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: 'suspended',
          suspended_at: new Date().toISOString(),
          suspended_by: user?.id,
          suspended_reason: reason,
        })
        .eq('id', userId);

      if (error) throw error;

      await supabase.rpc('log_admin_action', {
        action_type_param: 'suspend_user',
        target_user_id_param: userId,
        details_param: { reason },
      });

      toast.success('User suspended successfully');
      loadUsers();
      setSelectedUser(null);
      setConfirmAction(null);
      setSuspendReason('');
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    }
  }

  async function unsuspendUser(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: 'active',
          suspended_at: null,
          suspended_by: null,
          suspended_reason: null,
        })
        .eq('id', userId);

      if (error) throw error;

      await supabase.rpc('log_admin_action', {
        action_type_param: 'unsuspend_user',
        target_user_id_param: userId,
        details_param: {},
      });

      toast.success('User reactivated successfully');
      loadUsers();
      setSelectedUser(null);
      setConfirmAction(null);
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast.error('Failed to reactivate user');
    }
  }

  async function exportUserData(userId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('data_export_requests')
        .insert({
          user_id: userId,
          requested_by: user!.id,
          request_type: 'admin',
          export_format: 'json',
        });

      if (error) throw error;

      toast.success('Export request created. Processing will begin shortly.');
      toast.info('You will receive the download link once processing is complete.');
    } catch (error) {
      console.error('Error creating export request:', error);
      toast.error('Failed to create export request');
    }
  }

  async function deleteUser(userId: string) {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('account_deletion_requests')
        .insert({
          user_id: userId,
          requested_by: user!.id,
          request_type: 'admin',
          status: 'scheduled',
          scheduled_deletion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          deletion_reason: 'Admin requested deletion',
        });

      if (error) throw error;

      await supabase.rpc('log_admin_action', {
        action_type_param: 'schedule_deletion',
        target_user_id_param: userId,
        details_param: { scheduled_for: '30 days' },
      });

      toast.success('User deletion scheduled for 30 days from now');
      toast.info('The account can be restored during this grace period');
      loadUsers();
      setSelectedUser(null);
      setConfirmAction(null);
      setDeleteConfirmText('');
    } catch (error) {
      console.error('Error scheduling deletion:', error);
      toast.error('Failed to schedule deletion');
    }
  }

  async function addNote() {
    if (!selectedUser || !noteForm.note_text.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('admin_notes')
        .insert({
          user_id: selectedUser.id,
          admin_id: user!.id,
          note_text: noteForm.note_text,
          note_type: noteForm.note_type,
        });

      if (error) throw error;

      toast.success('Note added successfully');
      setNoteForm({ note_text: '', note_type: 'general' });
      loadNotes(selectedUser.id);
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  }

  function getPlanIcon(plan: string) {
    switch (plan) {
      case 'free':
        return <Zap className="w-4 h-4 text-slate-600" />;
      case 'pro':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'pro_plus':
        return <Crown className="w-4 h-4 text-violet-600" />;
      default:
        return null;
    }
  }

  function getPlanColor(plan: string) {
    switch (plan) {
      case 'free':
        return 'bg-slate-100 text-slate-700';
      case 'pro':
        return 'bg-blue-100 text-blue-700';
      case 'pro_plus':
        return 'bg-violet-100 text-violet-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      case 'deleted':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading users...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-600 mt-2">View and manage all user accounts</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email or name..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === 'active' ? 'primary' : 'outline'}
                onClick={() => setSelectedStatus('active')}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={selectedStatus === 'suspended' ? 'primary' : 'outline'}
                onClick={() => setSelectedStatus('suspended')}
                size="sm"
              >
                Suspended
              </Button>
              <Button
                variant={selectedStatus === 'all' ? 'primary' : 'outline'}
                onClick={() => setSelectedStatus('all')}
                size="sm"
              >
                All Status
              </Button>
            </div>
            <div className="border-l border-slate-300 mx-2"></div>
            <div className="flex gap-2">
              <Button
                variant={selectedPlan === 'all' ? 'primary' : 'outline'}
                onClick={() => setSelectedPlan('all')}
                size="sm"
              >
                All Plans
              </Button>
              <Button
                variant={selectedPlan === 'free' ? 'primary' : 'outline'}
                onClick={() => setSelectedPlan('free')}
                size="sm"
              >
                Free
              </Button>
              <Button
                variant={selectedPlan === 'pro' ? 'primary' : 'outline'}
                onClick={() => setSelectedPlan('pro')}
                size="sm"
              >
                Pro
              </Button>
              <Button
                variant={selectedPlan === 'pro_plus' ? 'primary' : 'outline'}
                onClick={() => setSelectedPlan('pro_plus')}
                size="sm"
              >
                Pro Plus
              </Button>
              <Button
                variant={selectedPlan === 'trial' ? 'primary' : 'outline'}
                onClick={() => setSelectedPlan('trial')}
                size="sm"
              >
                Trials
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Usage</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Last Login</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 flex items-center gap-2">
                          {user.full_name || 'No name'}
                          {user.role === 'admin' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(user.account_status)}`}>
                      {user.account_status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getPlanColor(user.current_plan)}`}>
                        {getPlanIcon(user.current_plan)}
                        {user.current_plan}
                      </span>
                      {user.trial_active && (
                        <span className="block text-xs text-green-600 font-medium">
                          Trial Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-slate-700">
                      {user.responses_used_this_month} responses
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setActiveTab('overview');
                        }}
                      >
                        Manage
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No users found</p>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full my-8">
            <div className="sticky top-0 bg-white border-b border-slate-200 rounded-t-xl px-6 py-4">
              <h3 className="text-xl font-bold text-slate-900">Manage User</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(selectedUser.account_status)}`}>
                  {selectedUser.account_status}
                </span>
                {selectedUser.role === 'admin' && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                    Admin
                  </span>
                )}
              </div>
            </div>

            <div className="border-b border-slate-200">
              <div className="flex px-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'notes'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Notes
                </button>
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'data'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Data & Actions
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="font-medium text-slate-900">{selectedUser.full_name || 'No name'}</div>
                    <div className="text-sm text-slate-600">{selectedUser.email}</div>
                    <div className="text-sm text-slate-500 mt-2">
                      Current Plan: <span className="font-medium capitalize">{selectedUser.current_plan}</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      Joined: {new Date(selectedUser.created_at).toLocaleDateString()}
                    </div>
                    {selectedUser.trial_active && (
                      <div className="text-sm text-green-600 mt-1">
                        Trial ends: {new Date(selectedUser.trial_end_date!).toLocaleDateString()}
                      </div>
                    )}
                    {selectedUser.account_status === 'suspended' && selectedUser.suspended_reason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Suspended:</strong> {selectedUser.suspended_reason}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-900 text-sm">Change Plan To:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={selectedUser.current_plan === 'free' ? 'primary' : 'outline'}
                        onClick={() => changePlan(selectedUser.id, 'free')}
                        disabled={selectedUser.current_plan === 'free'}
                        className="w-full"
                        size="sm"
                      >
                        Free
                      </Button>
                      <Button
                        variant={selectedUser.current_plan === 'pro' ? 'primary' : 'outline'}
                        onClick={() => changePlan(selectedUser.id, 'pro')}
                        disabled={selectedUser.current_plan === 'pro'}
                        className="w-full"
                        size="sm"
                      >
                        Pro
                      </Button>
                      <Button
                        variant={selectedUser.current_plan === 'pro_plus' ? 'primary' : 'outline'}
                        onClick={() => changePlan(selectedUser.id, 'pro_plus')}
                        disabled={selectedUser.current_plan === 'pro_plus'}
                        className="w-full"
                        size="sm"
                      >
                        Pro Plus
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Button
                      variant="outline"
                      onClick={() => resetUsage(selectedUser.id)}
                      className="w-full"
                    >
                      Reset Usage Counter
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <h4 className="font-medium text-slate-900 mb-3">Add Note</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Note Type</label>
                        <select
                          value={noteForm.note_type}
                          onChange={(e) => setNoteForm({ ...noteForm, note_type: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="general">General</option>
                          <option value="support">Support</option>
                          <option value="billing">Billing</option>
                          <option value="security">Security</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <TextArea
                        value={noteForm.note_text}
                        onChange={(e) => setNoteForm({ ...noteForm, note_text: e.target.value })}
                        placeholder="Enter note..."
                        rows={3}
                      />
                      <Button onClick={addNote} className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-900">Previous Notes</h4>
                    {notes.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No notes yet</p>
                    ) : (
                      notes.map((note) => (
                        <div key={note.id} className="border border-slate-200 rounded-lg p-3 bg-white">
                          <div className="flex items-start justify-between mb-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                              {note.note_type}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(note.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.note_text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Export User Data</h4>
                    <p className="text-sm text-slate-600 mb-3">
                      Export all user data including surveys, responses, and account information.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => exportUserData(selectedUser.id)}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data (JSON)
                    </Button>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="font-medium text-slate-900 mb-3 text-red-600">Danger Zone</h4>

                    {selectedUser.account_status === 'active' ? (
                      <Button
                        variant="outline"
                        onClick={() => setConfirmAction({ type: 'suspend', userId: selectedUser.id })}
                        className="w-full border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Suspend Account
                      </Button>
                    ) : selectedUser.account_status === 'suspended' ? (
                      <Button
                        variant="outline"
                        onClick={() => setConfirmAction({ type: 'unsuspend', userId: selectedUser.id })}
                        className="w-full border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Reactivate Account
                      </Button>
                    ) : null}

                    <Button
                      variant="outline"
                      onClick={() => setConfirmAction({ type: 'delete', userId: selectedUser.id })}
                      className="w-full mt-3 border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-xl">
              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmAction?.type === 'suspend' && (
        <ConfirmModal
          isOpen={true}
          onClose={() => {
            setConfirmAction(null);
            setSuspendReason('');
          }}
          onConfirm={() => suspendUser(confirmAction.userId, suspendReason)}
          title="Suspend User Account"
          message="This will prevent the user from accessing their account. They will not be able to log in until reactivated."
          confirmText="Suspend Account"
          variant="danger"
        >
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reason for Suspension (required)
            </label>
            <TextArea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Enter reason for suspension..."
              rows={3}
            />
          </div>
        </ConfirmModal>
      )}

      {confirmAction?.type === 'unsuspend' && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => unsuspendUser(confirmAction.userId)}
          title="Reactivate User Account"
          message="This will restore full access to the user's account."
          confirmText="Reactivate Account"
        />
      )}

      {confirmAction?.type === 'delete' && (
        <ConfirmModal
          isOpen={true}
          onClose={() => {
            setConfirmAction(null);
            setDeleteConfirmText('');
          }}
          onConfirm={() => deleteUser(confirmAction.userId)}
          title="Delete User Account"
          message="This will schedule the account for permanent deletion in 30 days. During this grace period, the account can be restored. All associated data will be permanently deleted after 30 days."
          confirmText="Schedule Deletion"
          variant="danger"
        >
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type <span className="font-bold">DELETE</span> to confirm
            </label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
        </ConfirmModal>
      )}
    </AdminLayout>
  );
}
