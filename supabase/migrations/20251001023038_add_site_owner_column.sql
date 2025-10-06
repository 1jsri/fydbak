/*
  # Add Site Owner Column

  ## Overview
  Adds the is_site_owner column to profiles table to enable site owner admin access.

  ## Changes
  - Add is_site_owner column to profiles table with default value false
  - Add index for performance on is_site_owner lookups
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_site_owner boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_site_owner ON profiles(is_site_owner);
