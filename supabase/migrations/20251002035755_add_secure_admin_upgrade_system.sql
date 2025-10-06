/*
  # Secure Admin Role Upgrade System with Bulletproof Security

  ## Overview
  This migration creates a secure system for admin role management that prevents
  unauthorized users from gaining admin access while allowing legitimate admin
  email addresses to be automatically upgraded.

  ## Security Features

  1. **Secure Admin Settings Table**
     - Stores allowed admin email(s) in database (not exposed to client)
     - Only accessible by existing admins or system functions
     - Protected by strict RLS policies

  2. **Secure RPC Function for Role Upgrade**
     - Server-side validation of admin email
     - Checks requester's email against stored admin settings
     - Prevents unauthorized role escalation
     - Includes audit logging

  3. **Enhanced RLS Policies**
     - Blocks users from updating their own role field directly
     - Only allows role changes through secure RPC function
     - Prevents client-side manipulation
     - Enforces database-level security

  4. **Audit Logging**
     - All admin role changes are logged
     - Includes timestamp, user ID, and change details
     - Immutable audit trail for security review

  ## Changes Made

  1. Create admin_settings table for secure email storage
  2. Insert initial admin email configuration
  3. Create secure RPC function: upgrade_to_admin_if_authorized()
  4. Add strict RLS policy to prevent direct role updates
  5. Add audit logging trigger for role changes
  6. Grant minimal necessary permissions
*/

-- Step 1: Create secure admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin settings
DROP POLICY IF EXISTS "Only admins can read admin settings" ON admin_settings;
CREATE POLICY "Only admins can read admin settings"
  ON admin_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update admin settings
DROP POLICY IF EXISTS "Only admins can update admin settings" ON admin_settings;
CREATE POLICY "Only admins can update admin settings"
  ON admin_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 2: Insert initial admin email (this is secure as it's in the database)
INSERT INTO admin_settings (setting_key, setting_value)
VALUES ('primary_admin_email', 'jawwadsri@gmail.com')
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value,
    updated_at = now();

-- Step 3: Create secure RPC function for admin upgrade
CREATE OR REPLACE FUNCTION upgrade_to_admin_if_authorized()
RETURNS jsonb AS $$
DECLARE
  user_email text;
  allowed_admin_email text;
  user_current_role text;
  upgrade_performed boolean := false;
BEGIN
  -- Get the current user's email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();

  IF user_email IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not authenticated'
    );
  END IF;

  -- Get the current user's role
  SELECT role INTO user_current_role
  FROM profiles
  WHERE id = auth.uid();

  -- If already admin, no need to upgrade
  IF user_current_role = 'admin' THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'User is already an admin',
      'upgraded', false
    );
  END IF;

  -- Get the allowed admin email from secure settings
  SELECT setting_value INTO allowed_admin_email
  FROM admin_settings
  WHERE setting_key = 'primary_admin_email';

  -- Check if user's email matches the allowed admin email
  IF user_email = allowed_admin_email THEN
    -- Upgrade the user to admin
    UPDATE profiles
    SET 
      role = 'admin',
      is_site_owner = true,
      updated_at = now()
    WHERE id = auth.uid();

    upgrade_performed := true;

    -- Log the upgrade action
    INSERT INTO owner_audit_log (owner_id, action_type, target_user_id, details)
    VALUES (
      auth.uid(),
      'admin_auto_upgrade',
      auth.uid(),
      jsonb_build_object(
        'email', user_email,
        'previous_role', user_current_role,
        'new_role', 'admin',
        'method', 'automatic_upgrade',
        'timestamp', now()
      )
    );

    RETURN jsonb_build_object(
      'success', true,
      'message', 'Successfully upgraded to admin',
      'upgraded', true
    );
  ELSE
    -- Email does not match - unauthorized
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Not authorized for admin access',
      'upgraded', false
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upgrade_to_admin_if_authorized() TO authenticated;

-- Step 4: Add strict RLS policy to prevent direct role updates by users
-- Drop existing permissive policies that might allow users to update their own role
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate user update policy WITHOUT allowing role changes
CREATE POLICY "Users can update own profile (no role changes)"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Ensure role cannot be changed directly by user
    AND (
      role = (SELECT role FROM profiles WHERE id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.role = 'admin'
      )
    )
  );

-- Step 5: Create trigger function to log role changes
CREATE OR REPLACE FUNCTION log_profile_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if role actually changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO owner_audit_log (owner_id, action_type, target_user_id, details)
    VALUES (
      COALESCE(auth.uid(), NEW.id),
      'role_change',
      NEW.id,
      jsonb_build_object(
        'email', NEW.email,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_at', now(),
        'changed_by', auth.uid()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role changes
DROP TRIGGER IF EXISTS profile_role_change_trigger ON profiles;
CREATE TRIGGER profile_role_change_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION log_profile_role_change();

-- Step 6: Add helper function to check if user email is authorized admin
CREATE OR REPLACE FUNCTION is_authorized_admin_email()
RETURNS boolean AS $$
DECLARE
  user_email text;
  allowed_email text;
BEGIN
  -- Get current user's email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Get allowed admin email
  SELECT setting_value INTO allowed_email
  FROM admin_settings
  WHERE setting_key = 'primary_admin_email';

  RETURN user_email = allowed_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION is_authorized_admin_email() TO authenticated;

-- Step 7: Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);

-- Step 8: Add comment for documentation
COMMENT ON FUNCTION upgrade_to_admin_if_authorized() IS 
'Securely upgrades a user to admin role if their email matches the primary_admin_email in admin_settings. This function is the ONLY way users should be upgraded to admin, preventing unauthorized access.';

COMMENT ON TABLE admin_settings IS
'Stores secure configuration settings for admin management. This table is protected by RLS and only accessible to existing admins.';
