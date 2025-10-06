/*
  # User Settings and Enhanced Admin Features

  ## Overview
  This migration adds comprehensive user settings management and enhanced admin capabilities
  for managing users, including preferences, account status, admin notes, and data export/deletion tracking.

  ## New Tables
  
  ### user_preferences
  - Stores user notification preferences, language, timezone, and other settings
  - One-to-one relationship with profiles
  - Allows users to control their experience
  
  ### admin_notes
  - Internal notes admins can add about users
  - Tracks support interactions and important account information
  - Includes note text, admin who created it, and timestamp
  
  ### data_export_requests
  - Audit trail of all user data export requests
  - Tracks who requested it, when, and completion status
  - Used for GDPR compliance tracking
  
  ### account_deletion_requests
  - Tracks account deletion requests for soft delete functionality
  - 30-day grace period before permanent deletion
  - Includes deletion reason and status
  
  ## Profile Updates
  - Added `account_status` field (active, suspended, deleted)
  - Added `last_login_at` timestamp
  - Added `suspended_at` and `suspended_by` for tracking suspensions
  - Added `suspended_reason` for documenting why account was suspended
  
  ## Security
  - Enable RLS on all new tables
  - Users can read/update their own preferences
  - Only admins can access admin_notes, export requests, and deletion requests
  - Proper audit logging for sensitive operations
*/

-- Add new fields to profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'suspended_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN suspended_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'suspended_by'
  ) THEN
    ALTER TABLE profiles ADD COLUMN suspended_by uuid REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'suspended_reason'
  ) THEN
    ALTER TABLE profiles ADD COLUMN suspended_reason text;
  END IF;
END $$;

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Notification Settings
  email_on_response boolean DEFAULT true,
  email_on_usage_alert boolean DEFAULT true,
  email_on_product_updates boolean DEFAULT false,
  digest_frequency text DEFAULT 'weekly' CHECK (digest_frequency IN ('daily', 'weekly', 'never')),
  
  -- App Preferences
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  
  -- Survey Defaults
  default_survey_duration_type text DEFAULT 'indefinite' CHECK (default_survey_duration_type IN ('hours', 'days', 'indefinite')),
  default_survey_duration_value integer,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all preferences
CREATE POLICY "Admins can view all preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create admin_notes table
CREATE TABLE IF NOT EXISTS admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note_text text NOT NULL,
  note_type text DEFAULT 'general' CHECK (note_type IN ('general', 'support', 'billing', 'security', 'other')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- Only admins can manage notes
CREATE POLICY "Admins can view all notes"
  ON admin_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert notes"
  ON admin_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update notes"
  ON admin_notes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete notes"
  ON admin_notes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create data_export_requests table
CREATE TABLE IF NOT EXISTS data_export_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES profiles(id),
  request_type text DEFAULT 'self' CHECK (request_type IN ('self', 'admin')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  export_format text DEFAULT 'json' CHECK (export_format IN ('json', 'csv')),
  file_url text,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own export requests
CREATE POLICY "Users can view own export requests"
  ON data_export_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = requested_by);

-- Users can create their own export requests
CREATE POLICY "Users can create own export requests"
  ON data_export_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND auth.uid() = requested_by);

-- Admins can view all export requests
CREATE POLICY "Admins can view all export requests"
  ON data_export_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can create export requests for any user
CREATE POLICY "Admins can create export requests"
  ON data_export_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create account_deletion_requests table
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES profiles(id),
  request_type text DEFAULT 'self' CHECK (request_type IN ('self', 'admin')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
  deletion_reason text,
  scheduled_deletion_date timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own deletion requests
CREATE POLICY "Users can view own deletion requests"
  ON account_deletion_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = requested_by);

-- Users can create their own deletion requests
CREATE POLICY "Users can create own deletion requests"
  ON account_deletion_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND auth.uid() = requested_by);

-- Admins can view all deletion requests
CREATE POLICY "Admins can view all deletion requests"
  ON account_deletion_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can manage all deletion requests
CREATE POLICY "Admins can manage deletion requests"
  ON account_deletion_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_user_id ON admin_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_admin_id ON admin_notes(admin_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_status ON data_export_requests(status);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_user_id ON account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_status ON account_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login_at ON profiles(last_login_at);

-- Update function to set updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_preferences_updated_at'
  ) THEN
    CREATE TRIGGER update_user_preferences_updated_at
      BEFORE UPDATE ON user_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_admin_notes_updated_at'
  ) THEN
    CREATE TRIGGER update_admin_notes_updated_at
      BEFORE UPDATE ON admin_notes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;