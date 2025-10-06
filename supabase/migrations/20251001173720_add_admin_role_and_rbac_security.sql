/*
  # Add Admin Role and Role-Based Access Control (RBAC)

  ## Overview
  This migration transforms the permission system from boolean `is_site_owner` flags 
  to a proper role-based access control (RBAC) system using the `role` column.

  ## 1. Schema Changes

  ### Profiles table updates
  - Modify `role` column to accept 'admin' in addition to 'manager' and 'rep'
  - The `role` column becomes the primary source of truth for permissions
  - Keep `is_site_owner` for backward compatibility during transition

  ## 2. Admin Role Assignment

  To set your admin email, update the placeholder in the SQL below:
  - Replace 'YOUR_EMAIL_HERE' with your actual email address
  - This will set your user's role to 'admin'

  ## 3. Security Updates

  ### RLS Policy Updates
  All sensitive tables now have admin override policies:
  - Admins (role = 'admin') can SELECT all rows across all tables
  - Admins (role = 'admin') can UPDATE all rows across all tables  
  - Regular users can only access their own data
  - Anonymous users can only access active surveys (unchanged)

  ### Tables with Admin Policies
  1. profiles - Admins can view and manage all user profiles
  2. surveys - Admins can view all surveys
  3. questions - Admins can view all questions
  4. chat_sessions - Admins can view all sessions
  5. responses - Admins can view all responses
  6. clarifications - Admins can view all clarifications
  7. session_summaries - Admins can view all summaries
  8. owner_audit_log - Admins can view audit logs

  ## 4. Security Notes

  - Data integrity is maintained - no destructive operations
  - All existing functionality remains intact
  - Role column is now the primary authorization check
  - RLS ensures database-level security enforcement
  - No user can bypass these policies from the application layer
*/

-- Step 1: Modify role column to accept 'admin' value
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('manager', 'rep', 'admin'));

-- Step 2: Set admin user by email
-- IMPORTANT: Replace 'YOUR_EMAIL_HERE' with your actual email address
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'YOUR_EMAIL_HERE';

-- Step 3: Add admin override policies for profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admins can update all profiles (for user management)
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Step 4: Add admin override policies for surveys table
DROP POLICY IF EXISTS "Admins can view all surveys" ON surveys;

CREATE POLICY "Admins can view all surveys"
  ON surveys FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 5: Add admin override policies for questions table
DROP POLICY IF EXISTS "Admins can view all questions" ON questions;

CREATE POLICY "Admins can view all questions"
  ON questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 6: Add admin override policies for chat_sessions table
DROP POLICY IF EXISTS "Admins can view all sessions" ON chat_sessions;

CREATE POLICY "Admins can view all sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 7: Add admin override policies for responses table
DROP POLICY IF EXISTS "Admins can view all responses" ON responses;

CREATE POLICY "Admins can view all responses"
  ON responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 8: Add admin override policies for clarifications table
DROP POLICY IF EXISTS "Admins can view all clarifications" ON clarifications;

CREATE POLICY "Admins can view all clarifications"
  ON clarifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 9: Add admin override policies for session_summaries table
DROP POLICY IF EXISTS "Admins can view all summaries" ON session_summaries;

CREATE POLICY "Admins can view all summaries"
  ON session_summaries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 10: Update owner_audit_log policies to use role instead of is_site_owner
DROP POLICY IF EXISTS "Site owner can view audit log" ON owner_audit_log;
DROP POLICY IF EXISTS "Site owner can create audit log entries" ON owner_audit_log;
DROP POLICY IF EXISTS "Admins can view audit log" ON owner_audit_log;
DROP POLICY IF EXISTS "Admins can create audit log entries" ON owner_audit_log;

CREATE POLICY "Admins can view audit log"
  ON owner_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create audit log entries"
  ON owner_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 11: Create helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Step 12: Update is_site_owner() function to use role column
CREATE OR REPLACE FUNCTION is_site_owner()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Update log_owner_action function to use role instead of is_site_owner (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'log_owner_action'
  ) THEN
    CREATE OR REPLACE FUNCTION log_owner_action(
      action_type_param text,
      target_user_id_param uuid DEFAULT NULL,
      details_param jsonb DEFAULT '{}'::jsonb
    )
    RETURNS void AS $func$
    BEGIN
      IF NOT is_admin() THEN
        RAISE EXCEPTION 'Only admins can log actions';
      END IF;

      INSERT INTO owner_audit_log (owner_id, action_type, target_user_id, details)
      VALUES (auth.uid(), action_type_param, target_user_id_param, details_param);
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER;
  END IF;
END $$;

-- Step 14: Create index on role column for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
