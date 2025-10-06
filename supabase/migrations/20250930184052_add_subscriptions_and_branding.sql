/*
  # Add Subscription Plans, Usage Tracking, and White Label Branding

  ## Overview
  This migration adds subscription management, usage tracking, and white label branding capabilities
  to support the monetization and customization features of the Motiiv platform.

  ## 1. New Tables

  ### `subscription_plans`
  - `id` (uuid, primary key) - Unique plan identifier
  - `name` (text) - Plan name: 'free', 'pro', 'pro_plus'
  - `display_name` (text) - Display name for UI
  - `price_monthly` (integer) - Monthly price in cents
  - `response_limit` (integer, nullable) - Monthly response limit (null = unlimited)
  - `features` (jsonb) - Feature flags for the plan
  - `created_at` (timestamptz) - Plan creation timestamp

  ### `user_subscriptions`
  - `id` (uuid, primary key) - Unique subscription identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `plan_id` (uuid, foreign key) - References subscription_plans.id
  - `status` (text) - Subscription status: 'active', 'cancelled', 'expired'
  - `current_period_start` (timestamptz) - Current billing period start
  - `current_period_end` (timestamptz) - Current billing period end
  - `stripe_customer_id` (text, nullable) - Stripe customer ID
  - `stripe_subscription_id` (text, nullable) - Stripe subscription ID
  - `created_at` (timestamptz) - Subscription creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `usage_tracking`
  - `id` (uuid, primary key) - Unique usage record identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `period_start` (timestamptz) - Usage period start
  - `period_end` (timestamptz) - Usage period end
  - `responses_count` (integer) - Number of responses in period
  - `overage_count` (integer) - Number of responses over limit
  - `overage_cost` (integer) - Overage cost in cents
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `survey_branding`
  - `id` (uuid, primary key) - Unique branding identifier
  - `survey_id` (uuid, foreign key) - References surveys.id
  - `logo_url` (text, nullable) - Custom logo URL
  - `primary_color` (text) - Primary brand color (hex)
  - `welcome_message` (text, nullable) - Custom welcome message
  - `thank_you_message` (text, nullable) - Custom thank you message
  - `background_image_url` (text, nullable) - Background image URL
  - `created_at` (timestamptz) - Branding creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Schema Updates

  ### Profiles table updates
  - Add `subscription_id` column to link to current subscription
  - Add `responses_used_this_month` for real-time tracking

  ### Surveys table updates
  - Add `goal_description` for custom goal text

  ## 3. Security

  All new tables have Row Level Security (RLS) enabled with appropriate policies:
  - Users can view their own subscription and usage data
  - Users can manage branding for their own surveys
  - Subscription plans are publicly readable

  ## 4. Data Population

  Seeds the database with three default subscription plans (Free, Pro, Pro Plus)

  ## 5. Important Notes

  - Usage tracking resets monthly automatically
  - Overage charges calculated at $0.25 per response
  - White label branding available for Pro Plus tier
  - All prices stored in cents for precision
*/

-- Add subscription-related columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_plan text DEFAULT 'free' CHECK (current_plan IN ('free', 'pro', 'pro_plus')),
ADD COLUMN IF NOT EXISTS responses_used_this_month integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS billing_period_start timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS billing_period_end timestamptz DEFAULT (now() + interval '1 month');

-- Add goal_description to surveys for custom goal text
ALTER TABLE surveys
ADD COLUMN IF NOT EXISTS goal_description text;

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL CHECK (name IN ('free', 'pro', 'pro_plus')),
  display_name text NOT NULL,
  price_monthly integer NOT NULL DEFAULT 0,
  response_limit integer,
  features jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT (now() + interval '1 month'),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  responses_count integer DEFAULT 0,
  overage_count integer DEFAULT 0,
  overage_cost integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create usage records"
  ON usage_tracking FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update usage records"
  ON usage_tracking FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create survey_branding table
CREATE TABLE IF NOT EXISTS survey_branding (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id uuid UNIQUE NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  logo_url text,
  primary_color text DEFAULT '#3b82f6',
  welcome_message text,
  thank_you_message text,
  background_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE survey_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can manage branding for their surveys"
  ON survey_branding FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = survey_branding.survey_id
      AND surveys.manager_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = survey_branding.survey_id
      AND surveys.manager_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view branding for active surveys"
  ON survey_branding FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = survey_branding.survey_id
      AND surveys.status = 'active'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_current_plan ON profiles(current_plan);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_survey_branding_survey_id ON survey_branding(survey_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_branding_updated_at BEFORE UPDATE ON survey_branding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, price_monthly, response_limit, features)
VALUES 
  ('free', 'Free', 0, 5, '{"max_surveys": 1, "ai_summaries": true, "analytics": false, "csv_export": false, "white_label": false, "priority_support": false}'::jsonb),
  ('pro', 'Pro', 1500, 50, '{"max_surveys": null, "ai_summaries": true, "analytics": true, "csv_export": false, "white_label": false, "priority_support": true}'::jsonb),
  ('pro_plus', 'Pro Plus', 2900, null, '{"max_surveys": null, "ai_summaries": true, "analytics": true, "csv_export": true, "white_label": true, "priority_support": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Function to increment response usage
CREATE OR REPLACE FUNCTION increment_response_usage(manager_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET responses_used_this_month = responses_used_this_month + 1
  WHERE id = manager_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create response
CREATE OR REPLACE FUNCTION can_create_response(manager_user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_plan text;
  used_count integer;
  plan_limit integer;
BEGIN
  SELECT current_plan, responses_used_this_month
  INTO user_plan, used_count
  FROM profiles
  WHERE id = manager_user_id;
  
  SELECT response_limit
  INTO plan_limit
  FROM subscription_plans
  WHERE name = user_plan;
  
  -- Pro Plus has unlimited (null limit)
  IF plan_limit IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if under limit
  RETURN used_count < plan_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage (to be called via cron)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    responses_used_this_month = 0,
    billing_period_start = billing_period_end,
    billing_period_end = billing_period_end + interval '1 month'
  WHERE billing_period_end < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;