export const STRIPE_PRICE_IDS = {
  pro_monthly: 'price_pro_monthly',
  pro_yearly: 'price_pro_yearly',
  pro_plus_monthly: 'price_pro_plus_monthly',
  pro_plus_yearly: 'price_pro_plus_yearly',
};

export const PLAN_PRICES = {
  free: 0,
  pro: 1500,
  pro_plus: 2900,
};

export const OVERAGE_PRICE = 25;

export function getPlanPrice(plan: string, yearly: boolean = false): number {
  const monthlyPrice = PLAN_PRICES[plan as keyof typeof PLAN_PRICES] || 0;
  if (yearly && monthlyPrice > 0) {
    return Math.round(monthlyPrice * 12 * 0.7);
  }
  return monthlyPrice;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function calculateOverageCharge(
  responsesUsed: number,
  responseLimit: number | null
): number {
  if (responseLimit === null) return 0;
  const overage = Math.max(0, responsesUsed - responseLimit);
  return overage * OVERAGE_PRICE;
}

export async function createCheckoutSession(
  planName: 'pro' | 'pro_plus',
  billingPeriod: 'monthly' | 'yearly',
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  return {
    url: null,
    error: 'Stripe integration not yet configured. Please contact support@fydbak.com to upgrade your plan.',
  };
}

export async function createPortalSession(
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  return {
    url: null,
    error: 'Stripe integration not yet configured. Please contact support@fydbak.com for billing management.',
  };
}
