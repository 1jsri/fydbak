import { supabase } from '../lib/supabase';

export interface UsageLimits {
  responseLimit: number | null;
  responsesUsed: number;
  surveysLimit: number | null;
  activeSurveys: number;
  canCreateResponse: boolean;
  canCreateSurvey: boolean;
  needsUpgrade: boolean;
  percentUsed: number;
}

export async function checkUsageLimits(userId: string): Promise<UsageLimits> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_plan, responses_used_this_month')
      .eq('id', userId)
      .single();

    if (!profile) {
      throw new Error('Profile not found');
    }

    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('response_limit, features')
      .eq('name', profile.current_plan)
      .single();

    if (!plan) {
      throw new Error('Plan not found');
    }

    const { count: activeSurveyCount } = await supabase
      .from('surveys')
      .select('*', { count: 'only', head: true })
      .eq('manager_id', userId)
      .eq('status', 'active');

    const responseLimit = plan.response_limit;
    const responsesUsed = profile.responses_used_this_month || 0;
    const surveysLimit = plan.features?.max_surveys || null;
    const activeSurveys = activeSurveyCount || 0;

    const canCreateResponse = responseLimit === null || responsesUsed < responseLimit;
    const canCreateSurvey = surveysLimit === null || activeSurveys < surveysLimit;

    const percentUsed = responseLimit
      ? Math.round((responsesUsed / responseLimit) * 100)
      : 0;

    const needsUpgrade = !canCreateResponse || !canCreateSurvey;

    return {
      responseLimit,
      responsesUsed,
      surveysLimit,
      activeSurveys,
      canCreateResponse,
      canCreateSurvey,
      needsUpgrade,
      percentUsed,
    };
  } catch (error) {
    console.error('Error checking usage limits:', error);
    return {
      responseLimit: null,
      responsesUsed: 0,
      surveysLimit: null,
      activeSurveys: 0,
      canCreateResponse: true,
      canCreateSurvey: true,
      needsUpgrade: false,
      percentUsed: 0,
    };
  }
}

export async function incrementResponseUsage(managerId: string): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('responses_used_this_month')
      .eq('id', managerId)
      .single();

    if (!profile) return;

    await supabase
      .from('profiles')
      .update({
        responses_used_this_month: (profile.responses_used_this_month || 0) + 1,
      })
      .eq('id', managerId);
  } catch (error) {
    console.error('Error incrementing response usage:', error);
  }
}

export function getUsageWarningLevel(percentUsed: number): 'none' | 'warning' | 'critical' {
  if (percentUsed >= 90) return 'critical';
  if (percentUsed >= 75) return 'warning';
  return 'none';
}

export function getUsageWarningMessage(
  percentUsed: number,
  responsesUsed: number,
  responseLimit: number | null
): string | null {
  if (responseLimit === null) return null;

  const remaining = responseLimit - responsesUsed;

  if (percentUsed >= 100) {
    return 'You have reached your monthly response limit. Additional responses will incur overage charges of $0.25 each.';
  }

  if (percentUsed >= 90) {
    return `You have ${remaining} response${remaining === 1 ? '' : 's'} remaining this month. Consider upgrading to avoid overage charges.`;
  }

  if (percentUsed >= 75) {
    return `You've used ${percentUsed}% of your monthly responses. ${remaining} remaining.`;
  }

  return null;
}

export function shouldShowUpgradePrompt(
  currentPlan: string,
  percentUsed: number
): boolean {
  if (currentPlan === 'pro_plus') return false;
  return percentUsed >= 75;
}

export function getRecommendedPlan(
  currentPlan: string,
  responsesUsed: number
): 'pro' | 'pro_plus' | null {
  if (currentPlan === 'pro_plus') return null;

  if (currentPlan === 'free') {
    if (responsesUsed > 20) return 'pro';
    return null;
  }

  if (currentPlan === 'pro') {
    if (responsesUsed > 40) return 'pro_plus';
    return null;
  }

  return null;
}
