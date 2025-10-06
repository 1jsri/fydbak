import { TrendingUp, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../shared/Button';

interface UsageDisplayProps {
  currentPlan: 'free' | 'pro' | 'pro_plus';
  responsesUsed: number;
  responseLimit: number | null;
  billingPeriodEnd: string;
}

const PLAN_INFO = {
  free: {
    name: 'Free',
    color: 'slate',
    icon: Zap,
    limit: 5
  },
  pro: {
    name: 'Pro',
    color: 'blue',
    icon: TrendingUp,
    limit: 50
  },
  pro_plus: {
    name: 'Pro Plus',
    color: 'violet',
    icon: Crown,
    limit: null
  }
};

export function UsageDisplay({ currentPlan, responsesUsed, responseLimit, billingPeriodEnd }: UsageDisplayProps) {
  const planInfo = PLAN_INFO[currentPlan];
  const Icon = planInfo.icon;
  const limit = responseLimit ?? planInfo.limit;
  const isUnlimited = limit === null;
  const usagePercent = isUnlimited ? 0 : Math.min((responsesUsed / limit) * 100, 100);
  const isNearLimit = !isUnlimited && usagePercent >= 80;
  const isOverLimit = !isUnlimited && responsesUsed >= limit;
  
  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(billingPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            currentPlan === 'free' ? 'bg-slate-100' :
            currentPlan === 'pro' ? 'bg-blue-100' :
            'bg-violet-100'
          }`}>
            <Icon className={`w-5 h-5 ${
              currentPlan === 'free' ? 'text-slate-600' :
              currentPlan === 'pro' ? 'text-blue-600' :
              'text-violet-600'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{planInfo.name} Plan</h3>
            <p className="text-sm text-slate-500">
              {daysRemaining} days left in billing period
            </p>
          </div>
        </div>
        {currentPlan !== 'pro_plus' && (
          <Link to="/billing">
            <Button size="sm" variant="outline">Upgrade</Button>
          </Link>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Response Usage</span>
          <span className={`font-semibold ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-slate-900'}`}>
            {responsesUsed} / {isUnlimited ? '∞' : limit}
          </span>
        </div>

        {!isUnlimited && (
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all rounded-full ${
                isOverLimit ? 'bg-red-600' : 
                isNearLimit ? 'bg-yellow-500' : 
                'bg-blue-600'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        )}

        {isOverLimit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              You've exceeded your monthly limit. Additional responses at $0.25 each.
            </p>
          </div>
        )}

        {isNearLimit && !isOverLimit && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              You're approaching your monthly limit. Consider upgrading to avoid overages.
            </p>
          </div>
        )}

        {isUnlimited && (
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
            <p className="text-sm text-violet-800 font-medium">
              Unlimited responses included with Pro Plus
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
