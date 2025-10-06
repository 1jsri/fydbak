import { useEffect, useState } from 'react';
import { Plus, Copy, Check, XCircle, Users, Calendar, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ManagerLayout } from '../../components/manager/ManagerLayout';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import type { TrialLink, TrialRedemption, Profile } from '../../types';

interface TrialLinkWithRedemptions extends TrialLink {
  redemptions?: (TrialRedemption & { user?: Profile })[];
}

export function TrialLinks() {
  const { user } = useAuth();
  const toast = useToast();
  const [trialLinks, setTrialLinks] = useState<TrialLinkWithRedemptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: '',
    trial_plan: 'pro' as 'pro' | 'pro_plus',
    duration_days: 30,
    max_redemptions: '',
    expires_at: '',
  });

  useEffect(() => {
    loadTrialLinks();
  }, []);

  async function loadTrialLinks() {
    try {
      const { data, error } = await supabase
        .from('trial_links')
        .select(`
          *,
          redemptions:trial_redemptions(
            *,
            user:profiles(email, full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setTrialLinks(data);
      }
    } catch (error) {
      console.error('Error loading trial links:', error);
      toast.error('Failed to load trial links');
    } finally {
      setLoading(false);
    }
  }

  function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async function createTrialLink() {
    if (!user || !formData.label) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const code = generateCode();
      const { error } = await supabase.from('trial_links').insert({
        code,
        label: formData.label,
        trial_plan: formData.trial_plan,
        duration_days: formData.duration_days,
        max_redemptions: formData.max_redemptions ? parseInt(formData.max_redemptions) : null,
        expires_at: formData.expires_at || null,
        created_by: user.id,
      });

      if (error) throw error;

      await supabase.rpc('log_owner_action', {
        action_type_param: 'create_trial_link',
        target_user_id_param: null,
        details_param: { code, label: formData.label },
      });

      toast.success('Trial link created successfully');
      setShowGenerator(false);
      setFormData({
        label: '',
        trial_plan: 'pro',
        duration_days: 30,
        max_redemptions: '',
        expires_at: '',
      });
      loadTrialLinks();
    } catch (error) {
      console.error('Error creating trial link:', error);
      toast.error('Failed to create trial link');
    }
  }

  async function deactivateLink(linkId: string) {
    try {
      const { error } = await supabase
        .from('trial_links')
        .update({ active: false })
        .eq('id', linkId);

      if (error) throw error;

      toast.success('Trial link deactivated');
      loadTrialLinks();
    } catch (error) {
      console.error('Error deactivating link:', error);
      toast.error('Failed to deactivate link');
    }
  }

  function copyToClipboard(code: string) {
    const url = `${window.location.origin}/trial/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    toast.success('Trial link copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function isExpired(link: TrialLink): boolean {
    if (!link.expires_at) return false;
    return new Date(link.expires_at) < new Date();
  }

  function isFullyRedeemed(link: TrialLink): boolean {
    if (!link.max_redemptions) return false;
    return link.redemptions_count >= link.max_redemptions;
  }

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading trial links...</div>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Trial Links</h1>
            <p className="text-slate-600 mt-2">Create and manage trial redemption links</p>
          </div>
          <Button onClick={() => setShowGenerator(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Trial Link
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {trialLinks.map((link) => {
          const expired = isExpired(link);
          const fullyRedeemed = isFullyRedeemed(link);
          const inactive = !link.active || expired || fullyRedeemed;

          return (
            <div
              key={link.id}
              className={`bg-white rounded-xl border-2 p-6 ${
                inactive ? 'border-slate-200 opacity-75' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{link.label}</h3>
                    {inactive && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                        {!link.active ? 'Inactive' : expired ? 'Expired' : 'Fully Redeemed'}
                      </span>
                    )}
                    {link.active && !expired && !fullyRedeemed && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>
                        {link.redemptions_count}
                        {link.max_redemptions ? `/${link.max_redemptions}` : ''} redeemed
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{link.duration_days} day trial</span>
                    </div>
                    <span className="capitalize font-medium text-blue-600">
                      {link.trial_plan.replace('_', ' ')} Plan
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <code className="flex-1 text-sm font-mono text-slate-700">
                      {window.location.origin}/trial/{link.code}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(link.code)}
                    >
                      {copiedCode === link.code ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {link.active && !expired && !fullyRedeemed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deactivateLink(link.id)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Deactivate
                  </Button>
                )}
              </div>

              {link.redemptions && link.redemptions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Recent Redemptions</h4>
                  <div className="space-y-2">
                    {link.redemptions.slice(0, 3).map((redemption) => (
                      <div
                        key={redemption.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="text-slate-700">
                          {redemption.user?.full_name || redemption.user?.email || 'Unknown'}
                        </div>
                        <div className="text-slate-500">
                          {new Date(redemption.redeemed_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {trialLinks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <LinkIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">No trial links created yet</p>
          <Button onClick={() => setShowGenerator(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Trial Link
          </Button>
        </div>
      )}

      {showGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Create Trial Link</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Label *
                </label>
                <Input
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Summer Promotion, Partner Trial"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Trial Plan *
                </label>
                <select
                  value={formData.trial_plan}
                  onChange={(e) =>
                    setFormData({ ...formData, trial_plan: e.target.value as 'pro' | 'pro_plus' })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pro">Pro</option>
                  <option value="pro_plus">Pro Plus</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Duration (days) *
                </label>
                <Input
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) =>
                    setFormData({ ...formData, duration_days: parseInt(e.target.value) || 30 })
                  }
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Max Redemptions (optional)
                </label>
                <Input
                  type="number"
                  value={formData.max_redemptions}
                  onChange={(e) => setFormData({ ...formData, max_redemptions: e.target.value })}
                  placeholder="Unlimited if blank"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Expires On (optional)
                </label>
                <Input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setShowGenerator(false)}>
                Cancel
              </Button>
              <Button onClick={createTrialLink}>Create Trial Link</Button>
            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  );
}
