/*
  # Fix Owner Profile Access

  ## Overview
  Fixes Row Level Security policies on profiles table to allow site owners to view all profiles.
  The original policy restricted users to only viewing their own profile, which prevented site owners
  from accessing dashboard statistics even with a separate owner policy in place.

  ## Changes Made
  1. Drop the original restrictive "Users can view own profile" policy
  2. Create a new policy that allows:
     - Users to view their own profile (auth.uid() = id)
     - Site owners to view all profiles (is_site_owner = true)

  ## Security Impact
  - Regular users: Can still only view their own profile (no change)
  - Site owners: Can now view all profiles for dashboard and user management
  - Maintains security by checking is_site_owner flag which can only be set by database admins

  ## Notes
  - This consolidates the profile viewing logic into a single, comprehensive policy
  - Site owner access is granted through OR condition, allowing proper data retrieval
  - The policy uses EXISTS subquery for site owner check to ensure proper evaluation
*/

-- Drop the original restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create a new comprehensive policy that allows users to view their own profile
-- AND allows site owners to view all profiles
CREATE POLICY "Users can view own profile and owners can view all"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR
    EXISTS (
      SELECT 1 FROM profiles owner
      WHERE owner.id = auth.uid()
      AND owner.is_site_owner = true
    )
  );

-- Drop the separate site owner policy since it's now consolidated
DROP POLICY IF EXISTS "Site owner can view all profiles" ON profiles;