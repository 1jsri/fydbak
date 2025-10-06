/*
  # Add Site Owner Admin System and Trial Link Management

  ## Overview
  This migration adds site owner admin capabilities and trial link generation system.
  Only users with is_site_owner = true can access admin features and manage user subscriptions.

  ## 1. Schema Updates

  ### Profiles table updates
  - `is_site_owner` (boolean) - Flag for site owner admin access (only site owner has true)
  - `trial_active` (boolean) - Whether user is currently on a trial
  - `trial_plan` (text) - Plan type for active trial (pro or pro_plus)
  - `trial_start_date` (timestamptz) - When trial started
  - `trial_end_date` (timestamptz) - When trial expires
  - `trial_redeemed_at` (timestamptz) - When user redeemed their trial link

  ## 2. New Tables

  ### `trial_links`
  - `id` (uuid, primary key) - Unique identifier
  - `code` (text, unique) - Unique redemption code
  - `label` (text) - Optional label for organizing campaigns
  - `trial_plan` (text) - Plan type granted: 'pro' or 'pro_plus'
  - `duration_days` (integer) - Trial duration in days
  - `max_redemptions` (integer, nullable) - Maximum uses (null = unlimited)
  - `redemptions_count` (integer) - Current redemption count
  - `active` (boolean) - Whether link is active
  - `expires_at` (timestamptz, nullable) - Optional expiration date
  - `created_by` (uuid, foreign key) - Site owner who created it
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `trial_redemptions`
  - `id` (uuid, primary key) - Unique identifier
  - `trial_link_id` (uuid, foreign key) - References trial_links.id
  - `user_id` (uuid, foreign key) - User who redeemed
  - `redeemed_at` (timestamptz) - Redemption timestamp
  - `ip_address` (text, nullable) - IP address for fraud detection

  ### `owner_audit_log`
  - `id` (uuid, primary key) - Unique identifier
  - `owner_id` (uuid, foreign key) - Site owner who performed action
  - `action_type` (text) - Type of action performed
  - `target_user_id` (uuid, nullable) - User affected by action
  - `details` (jsonb) - Additional action details
  - `created_at` (timestamptz) - Action timestamp

  ## 3. Security

  All admin features protected by RLS policies checking is_site_owner = true.
  Trial redemption is public but limited to one per user.
  Audit logging tracks all owner actions.

  ## 4. Functions

  - `is_site_owner()` - Check if current user is site owner
  - `validate_trial_link()` - Validate trial code before redemption
  - `redeem_trial_link()` - Redeem trial and upgrade user account
  - `expire_trials()` - Automatically expire ended trials (called by Edge Function)
  - `log_owner_action()` - Log owner actions to audit table
*/

-- Add site owner and trial fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_site_owner boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_plan text CHECK (trial_plan IN ('pro', 'pro_plus')),
ADD COLUMN IF NOT EXISTS trial_start_date timestamptz,
ADD COLUMN IF NOT EXISTS trial_end_date timestamptz,
ADD COLUMN IF NOT EXISTS trial_redeemed_at timestamptz;

-- Create trial_links table
CREATE TABLE IF NOT EXISTS trial_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  label text,
  trial_plan text NOT NULL CHECK (trial_plan IN ('pro', 'pro_plus')),
  duration_days integer NOT NULL CHECK (duration_days > 0),
  max_redemptions integer CHECK (max_redemptions > 0),
  redemptions_count integer DEFAULT 0,
  active boolean DEFAULT true,
  expires_at timestamptz,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trial_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site owner can manage trial links"
  ON trial_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_site_owner = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_site_owner = true
    )
  );

CREATE POLICY "Anyone can view active trial links by code"
  ON trial_links FOR SELECT
  TO authenticated, anon
  USING (active = true);

-- Create trial_redemptions table
CREATE TABLE IF NOT EXISTS trial_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_link_id uuid NOT NULL REFERENCES trial_links(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  redeemed_at timestamptz DEFAULT now(),
  ip_address text,
  UNIQUE(user_id)
);

ALTER TABLE trial_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
  ON trial_redemptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Site owner can view all redemptions"
  ON trial_redemptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_site_owner = true
    )
  );

CREATE POLICY "Authenticated users can redeem trials"
  ON trial_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create owner_audit_log table
CREATE TABLE IF NOT EXISTS owner_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  target_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE owner_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site owner can view audit log"
  ON owner_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_site_owner = true
    )
  );

CREATE POLICY "Site owner can create audit log entries"
  ON owner_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_site_owner = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_site_owner ON profiles(is_site_owner);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_active ON profiles(trial_active);
CREATE INDEX IF NOT EXISTS idx_trial_links_code ON trial_links(code);
CREATE INDEX IF NOT EXISTS idx_trial_links_active ON trial_links(active);
CREATE INDEX IF NOT EXISTS idx_trial_redemptions_user_id ON trial_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_redemptions_trial_link_id ON trial_redemptions(trial_link_id);
CREATE INDEX IF NOT EXISTS idx_owner_audit_log_owner_id ON owner_audit_log(owner_id);
CREATE INDEX IF NOT EXISTS idx_owner_audit_log_target_user_id ON owner_audit_log(target_user_id);

-- Add trigger for trial_links updated_at
CREATE TRIGGER update_trial_links_updated_at BEFORE UPDATE ON trial_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check if current user is site owner
CREATE OR REPLACE FUNCTION is_site_owner()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_site_owner = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate trial link
CREATE OR REPLACE FUNCTION validate_trial_link(trial_code text)
RETURNS jsonb AS $$
DECLARE
  link_record trial_links%ROWTYPE;
  user_has_redeemed boolean;
  result jsonb;
BEGIN
  -- Get trial link
  SELECT * INTO link_record
  FROM trial_links
  WHERE code = trial_code;

  -- Check if trial link exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid trial code'
    );
  END IF;

  -- Check if active
  IF NOT link_record.active THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'This trial link is no longer active'
    );
  END IF;

  -- Check if expired
  IF link_record.expires_at IS NOT NULL AND link_record.expires_at < now() THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'This trial link has expired'
    );
  END IF;

  -- Check if max redemptions reached
  IF link_record.max_redemptions IS NOT NULL AND link_record.redemptions_count >= link_record.max_redemptions THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'This trial link has been fully redeemed'
    );
  END IF;

  -- Check if user already redeemed a trial
  SELECT EXISTS (
    SELECT 1 FROM trial_redemptions
    WHERE user_id = auth.uid()
  ) INTO user_has_redeemed;

  IF user_has_redeemed THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'You have already redeemed a trial'
    );
  END IF;

  -- Return valid with trial details
  RETURN jsonb_build_object(
    'valid', true,
    'trial_plan', link_record.trial_plan,
    'duration_days', link_record.duration_days,
    'label', link_record.label
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to redeem trial link
CREATE OR REPLACE FUNCTION redeem_trial_link(trial_code text, user_ip text DEFAULT NULL)
RETURNS jsonb AS $$
DECLARE
  link_record trial_links%ROWTYPE;
  validation_result jsonb;
  trial_end timestamp with time zone;
BEGIN
  -- Validate trial link
  validation_result := validate_trial_link(trial_code);

  IF NOT (validation_result->>'valid')::boolean THEN
    RETURN validation_result;
  END IF;

  -- Get trial link
  SELECT * INTO link_record
  FROM trial_links
  WHERE code = trial_code;

  -- Calculate trial end date
  trial_end := now() + (link_record.duration_days || ' days')::interval;

  -- Update user profile with trial
  UPDATE profiles
  SET
    current_plan = link_record.trial_plan,
    trial_active = true,
    trial_plan = link_record.trial_plan,
    trial_start_date = now(),
    trial_end_date = trial_end,
    trial_redeemed_at = now(),
    billing_period_start = now(),
    billing_period_end = trial_end
  WHERE id = auth.uid();

  -- Create redemption record
  INSERT INTO trial_redemptions (trial_link_id, user_id, ip_address)
  VALUES (link_record.id, auth.uid(), user_ip);

  -- Increment redemption count
  UPDATE trial_links
  SET redemptions_count = redemptions_count + 1
  WHERE id = link_record.id;

  RETURN jsonb_build_object(
    'success', true,
    'trial_plan', link_record.trial_plan,
    'trial_end_date', trial_end
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire trials
CREATE OR REPLACE FUNCTION expire_trials()
RETURNS void AS $$
BEGIN
  -- Update profiles where trial has ended
  UPDATE profiles
  SET
    current_plan = 'free',
    trial_active = false,
    responses_used_this_month = 0,
    billing_period_start = now(),
    billing_period_end = now() + interval '1 month'
  WHERE trial_active = true
    AND trial_end_date < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log owner actions
CREATE OR REPLACE FUNCTION log_owner_action(
  action_type_param text,
  target_user_id_param uuid DEFAULT NULL,
  details_param jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  -- Only site owners can log actions
  IF NOT is_site_owner() THEN
    RAISE EXCEPTION 'Only site owners can log actions';
  END IF;

  INSERT INTO owner_audit_log (owner_id, action_type, target_user_id, details)
  VALUES (auth.uid(), action_type_param, target_user_id_param, details_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_site_owner() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_trial_link(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION redeem_trial_link(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION expire_trials() TO authenticated;
GRANT EXECUTE ON FUNCTION log_owner_action(text, uuid, jsonb) TO authenticated;
