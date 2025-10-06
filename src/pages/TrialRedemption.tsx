import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Gift, Calendar, Crown, TrendingUp, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/shared/Button';

interface TrialDetails {
  valid: boolean;
  error?: string;
  trial_plan?: 'pro' | 'pro_plus';
  duration_days?: number;
  label?: string;
}

export function TrialRedemption() {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trialDetails, setTrialDetails] = useState<TrialDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  useEffect(() => {
    if (code) {
      validateTrial();
    }
  }, [code, user]);

  async function validateTrial() {
    try {
      const { data, error } = await supabase.rpc('validate_trial_link', {
        trial_code: code,
      });

      if (error) throw error;

      setTrialDetails(data as TrialDetails);
    } catch (error) {
      console.error('Error validating trial:', error);
      setTrialDetails({
        valid: false,
        error: 'Failed to validate trial code',
      });
    } finally {
      setLoading(false);
    }
  }

  async function redeemTrial() {
    if (!user) {
      navigate(`/register?redirect=/trial/${code}`);
      return;
    }

    setRedeeming(true);
    try {
      const { data, error } = await supabase.rpc('redeem_trial_link', {
        trial_code: code,
        user_ip: null,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (result.success) {
        setRedeemed(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setTrialDetails({
          valid: false,
          error: result.error || 'Failed to redeem trial',
        });
      }
    } catch (error) {
      console.error('Error redeeming trial:', error);
      setTrialDetails({
        valid: false,
        error: 'Failed to redeem trial',
      });
    } finally {
      setRedeeming(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600">Validating trial code...</p>
        </div>
      </div>
    );
  }

  if (redeemed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Trial Activated!</h1>
          <p className="text-slate-600 mb-6">
            Your {trialDetails?.trial_plan?.replace('_', ' ')} trial has been activated.
            Redirecting to your dashboard...
          </p>
          <div className="animate-pulse">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!trialDetails?.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">FydBak</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center p-4 pt-20">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Trial Code</h1>
            <p className="text-slate-600 mb-6">
              {trialDetails?.error || 'This trial code is not valid or has expired.'}
            </p>
            <div className="space-y-3">
              <Link to="/register">
                <Button className="w-full">Create Free Account</Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const PlanIcon = trialDetails.trial_plan === 'pro' ? TrendingUp : Crown;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">FydBak</span>
            </Link>
            {!user && (
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center p-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              You've Been Invited to Try FydBak!
            </h1>
            {trialDetails.label && (
              <p className="text-sm text-slate-500">{trialDetails.label}</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <PlanIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 text-center mb-4 capitalize">
              {trialDetails.trial_plan?.replace('_', ' ')} Plan Trial
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">Duration</span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {trialDetails.duration_days} Days
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-sm font-medium text-slate-700 mb-2">What's Included:</div>
                <ul className="space-y-1 text-sm text-slate-600">
                  {trialDetails.trial_plan === 'pro' ? (
                    <>
                      <li>• Unlimited surveys</li>
                      <li>• Up to 50 responses/month</li>
                      <li>• AI summaries & insights</li>
                      <li>• Advanced analytics</li>
                    </>
                  ) : (
                    <>
                      <li>• Unlimited surveys</li>
                      <li>• Unlimited responses</li>
                      <li>• AI summaries & insights</li>
                      <li>• CSV export & analytics</li>
                      <li>• Priority support</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {user ? (
            <Button
              onClick={redeemTrial}
              disabled={redeeming}
              className="w-full"
              size="lg"
            >
              {redeeming ? 'Activating Trial...' : 'Activate Trial'}
            </Button>
          ) : (
            <div className="space-y-3">
              <Link to={`/register?redirect=/trial/${code}`}>
                <Button className="w-full" size="lg">
                  Create Account & Start Trial
                </Button>
              </Link>
              <Link to={`/login?redirect=/trial/${code}`}>
                <Button variant="outline" className="w-full">
                  Sign In to Activate
                </Button>
              </Link>
            </div>
          )}

          <p className="text-xs text-slate-500 text-center mt-4">
            No credit card required. Trial converts to free plan automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
