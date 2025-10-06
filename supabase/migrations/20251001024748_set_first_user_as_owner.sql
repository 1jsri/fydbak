/*
  # Set First User as Site Owner

  ## Overview
  Sets the is_site_owner flag to true for the first user created in the system.
  This ensures there is at least one site owner who can access admin features.

  ## Changes Made
  1. Updates the oldest user (by created_at) to be the site owner
  2. Only sets if no existing site owner is found
  3. Logs the action for audit purposes

  ## Security Impact
  - Creates the initial site owner account
  - Uses created_at to identify the first registered user
  - Only executes if no site owner currently exists

  ## Notes
  - If you need to change which user is the site owner, you can manually update
    the is_site_owner field in the profiles table
  - This migration is idempotent - it won't change anything if a site owner already exists
*/

DO $$
DECLARE
  existing_owner_count INT;
  first_user_id UUID;
BEGIN
  -- Check if there's already a site owner
  SELECT COUNT(*) INTO existing_owner_count
  FROM profiles
  WHERE is_site_owner = true;

  -- Only proceed if no site owner exists
  IF existing_owner_count = 0 THEN
    -- Get the first user by creation date
    SELECT id INTO first_user_id
    FROM profiles
    ORDER BY created_at ASC
    LIMIT 1;

    -- Set them as site owner if a user exists
    IF first_user_id IS NOT NULL THEN
      UPDATE profiles
      SET is_site_owner = true
      WHERE id = first_user_id;

      RAISE NOTICE 'Set user % as site owner', first_user_id;
    ELSE
      RAISE NOTICE 'No users found in profiles table';
    END IF;
  ELSE
    RAISE NOTICE 'Site owner already exists, skipping';
  END IF;
END $$;