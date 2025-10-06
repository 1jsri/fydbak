import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, Crown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { checkUsageLimits, getUsageWarningLevel, getUsageWarningMessage } from '../../utils/usageTracking';
import { Button } from '../shared/Button';

export function UsageBanner() {
  const { user, profile } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [warningLevel, setWarningLevel] = useState<'none' | 'warning' | 'critical'>('none');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user && profile) {
      loadUsageStatus();
    }
  }, [user, profile]);

  async function loadUsageStatus() {
    if (!user) return;

    const usage = await checkUsageLimits(user.id);
    const level = getUsageWarningLevel(usage.percentUsed);
    const message = getUsageWarningMessage(
      usage.percentUsed,
      usage.responsesUsed,
      usage.responseLimit
    );

    setWarningLevel(level);
    setWarningMessage(message);
    setShowBanner(!!message && !dismissed);
  }

  if (!showBanner || !warningMessage) return null;

  const bannerColors = {
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      icon: 'text-amber-600',
    },
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      icon: 'text-red-600',
    },
  };

  const colors = warningLevel === 'critical' ? bannerColors.critical : bannerColors.warning;

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-4 mb-6`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <AlertTriangle className={`w-5 h-5 ${colors.icon} mr-3 flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className={`${colors.text} text-sm font-medium mb-2`}>
              {warningMessage}
            </p>
            {profile?.current_plan !== 'pro_plus' && (
              <div className="flex items-center space-x-3">
                <Link to="/billing">
                  <Button size="sm" variant="primary">
                    {profile?.current_plan === 'free' ? (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Pro Plus
                      </>
                    )}
                  </Button>
                </Link>
                <Link to="/billing" className={`text-sm ${colors.text} hover:underline`}>
                  View usage details
                </Link>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            setDismissed(true);
            setShowBanner(false);
          }}
          className={`${colors.text} hover:${colors.icon} p-1`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
