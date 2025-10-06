/*
  # Create Owner Database Functions

  ## Overview
  Creates database functions to support site owner features.

  ## Functions
  - is_site_owner: Check if current user is site owner
  - log_owner_action: Log owner actions to audit table (if needed)
*/

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_site_owner() TO authenticated;
