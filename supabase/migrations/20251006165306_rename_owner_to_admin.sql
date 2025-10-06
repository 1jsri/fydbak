/*
  # Rename Owner to Admin Throughout Database

  1. Changes
    - Rename `owner_audit_log` table to `admin_audit_log`
    - Rename `log_owner_action` function to `log_admin_action`
    - Update column names from `owner_id` to `admin_id`
    - Remove `is_site_owner` column (now using only admin role)
    - Update all RLS policies to use admin role instead of is_site_owner

  2. Security
    - Maintain all existing RLS policies with admin role checks
    - Ensure backward compatibility during transition
*/

-- Rename the owner_audit_log table to admin_audit_log
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'owner_audit_log'
  ) THEN
    ALTER TABLE owner_audit_log RENAME TO admin_audit_log;
    ALTER TABLE admin_audit_log RENAME COLUMN owner_id TO admin_id;
  END IF;
END $$;

-- Drop old function if exists
DROP FUNCTION IF EXISTS log_owner_action(text, uuid, jsonb);

-- Create new admin action logging function
CREATE OR REPLACE FUNCTION log_admin_action(
  action_type_param text,
  target_user_id_param uuid,
  details_param jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO admin_audit_log (admin_id, action_type, target_user_id, details)
  VALUES (auth.uid(), action_type_param, target_user_id_param, details_param);
END;
$$;

-- Update RLS policies to use admin role only (not is_site_owner)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Site owners can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Site owners can update user profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Update audit log policies
DROP POLICY IF EXISTS "Site owners can view audit log" ON admin_audit_log;
DROP POLICY IF EXISTS "Site owners can insert audit log" ON admin_audit_log;

CREATE POLICY "Admins can view audit log"
  ON admin_audit_log FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can insert audit log"
  ON admin_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    AND auth.uid() = admin_id
  );

-- Update trial links policies
DROP POLICY IF EXISTS "Site owners can manage trial links" ON trial_links;

CREATE POLICY "Admins can manage trial links"
  ON trial_links FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Note: We're keeping is_site_owner column for now for backward compatibility
-- It can be removed in a future migration after confirming everything works
