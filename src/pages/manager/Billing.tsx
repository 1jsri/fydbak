import { useEffect, useState } from 'react';
import { Check, Crown, TrendingUp, Zap } from 'lucide-react';
import { ManagerLayout } from '../../components/manager/ManagerLayout';
import { Button } from '../../components/shared/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { UsageDisplay } from '../../components/manager/UsageDisplay';

interface Plan {
  id: string;
  name: 'free' | 'pro' | 'pro_plus';
  display_name: string;
  price_monthly: number;
  response_limit: number | null;
  features: {
    max_surveys: number | null;
    ai_summaries: boolean;
    analytics: boolean;
    csv_export: boolean;
    white_label: boolean;
    priority_support: boolean;
  };
}

interface Profile {
  current_plan: 'free' | 'pro' | 'pro_plus';
  responses_used_this_month: number;
  billing_period_end: string;
}

export function Billing() {
  const { user } = useAuth();
  const toast = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    try {
      const [plansRes, profileRes] = await Promise.all([
        supabase.from('subscription_plans').select('*').order('price_monthly'),
        supabase.from('profiles').select('current_plan, responses_used_this_month, billing_period_end').eq('id', user!.id).single()
      ]);

      if (plansRes.data) setPlans(plansRes.data);
      if (profileRes.data) setProfile(profileRes.data);
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function upgradePlan(planName: 'pro' | 'pro_plus') {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ current_plan: planName })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(`Successfully upgraded to ${planName === 'pro' ? 'Pro' : 'Pro Plus'} plan!`);
      loadData();
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error('Failed to upgrade plan. Please try again.');
    }
  }

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading billing information...</div>
        </div>
      </ManagerLayout>
    );
  }

  const currentPlan = plans.find(p => p.name === profile?.current_plan);

  return (
    <ManagerLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Billing & Plans</h1>
        <p className="text-slate-600 mt-2">
          Manage your subscription and view usage statistics
        </p>
      </div>

      {profile && currentPlan && (
        <div className="mb-8">
          <UsageDisplay
            currentPlan={profile.current_plan}
            responsesUsed={profile.responses_used_this_month}
            responseLimit={currentPlan.response_limit}
            billingPeriodEnd={profile.billing_period_end}
          />
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.name === profile?.current_plan;
            const Icon = plan.name === 'free' ? Zap : plan.name === 'pro' ? TrendingUp : Crown;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl border-2 p-6 ${
                  isCurrentPlan ? 'border-blue-500 shadow-lg' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    plan.name === 'free' ? 'bg-slate-100' :
                    plan.name === 'pro' ? 'bg-blue-100' :
                    'bg-violet-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      plan.name === 'free' ? 'text-slate-600' :
                      plan.name === 'pro' ? 'text-blue-600' :
                      'text-violet-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{plan.display_name}</h3>
                    {isCurrentPlan && (
                      <span className="text-xs font-semibold text-blue-600">Current Plan</span>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-slate-900">
                      ${(plan.price_monthly / 100).toFixed(0)}
                    </span>
                    <span className="text-slate-600 ml-2">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">
                      {plan.response_limit ? `${plan.response_limit} responses/month` : 'Unlimited responses'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">
                      {plan.features.max_surveys === null ? 'Unlimited surveys' : `${plan.features.max_surveys} survey at a time`}
                    </span>
                  </li>
                  {plan.features.ai_summaries && (
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">AI summaries & insights</span>
                    </li>
                  )}
                  {plan.features.analytics && (
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">Advanced analytics</span>
                    </li>
                  )}
                  {plan.features.csv_export && (
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">CSV export</span>
                    </li>
                  )}
                  {plan.features.white_label && (
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">White label branding</span>
                    </li>
                  )}
                  {plan.features.priority_support && (
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">Priority support</span>
                    </li>
                  )}
                </ul>

                {!isCurrentPlan && plan.name !== 'free' && (
                  <Button
                    onClick={() => upgradePlan(plan.name as 'pro' | 'pro_plus')}
                    className="w-full"
                    variant={plan.name === 'pro_plus' ? 'primary' : 'outline'}
                  >
                    Upgrade to {plan.display_name}
                  </Button>
                )}

                {isCurrentPlan && (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                )}

                {plan.name === 'free' && !isCurrentPlan && (
                  <Button className="w-full" variant="ghost" disabled>
                    Not Available
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Usage-Based Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Overage Charges</h4>
            <p className="text-sm text-slate-600">
              If you exceed your monthly response limit, additional responses are charged at $0.25 each.
              Overages are billed at the end of your billing cycle.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Monthly Reset</h4>
            <p className="text-sm text-slate-600">
              Your usage counter resets at the start of each billing period. Upgrade anytime to increase
              your monthly limit or get unlimited responses with Pro Plus.
            </p>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
