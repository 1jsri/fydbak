/*
  # Add Owner RLS Policies

  ## Overview
  Adds Row Level Security policies to allow site owner to manage all users.

  ## Security Changes
  - Site owner can view all profiles
  - Site owner can update all profiles for user management
*/

-- Site owner can view all profiles
CREATE POLICY "Site owner can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles owner
      WHERE owner.id = auth.uid()
      AND owner.is_site_owner = true
    )
  );

-- Site owner can update all profiles
CREATE POLICY "Site owner can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles owner
      WHERE owner.id = auth.uid()
      AND owner.is_site_owner = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles owner
      WHERE owner.id = auth.uid()
      AND owner.is_site_owner = true
    )
  );
