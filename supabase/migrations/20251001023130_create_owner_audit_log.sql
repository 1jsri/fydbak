/*
  # Create Owner Audit Log Table

  ## Overview
  Creates the owner_audit_log table for tracking site owner actions.

  ## New Tables
  - owner_audit_log: Stores audit trail of owner actions

  ## Security
  - RLS enabled with policies for site owner access only
*/

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
CREATE INDEX IF NOT EXISTS idx_owner_audit_log_owner_id ON owner_audit_log(owner_id);
CREATE INDEX IF NOT EXISTS idx_owner_audit_log_target_user_id ON owner_audit_log(target_user_id);

-- Function to log owner actions
CREATE OR REPLACE FUNCTION log_owner_action(
  action_type_param text,
  target_user_id_param uuid DEFAULT NULL,
  details_param jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  IF NOT is_site_owner() THEN
    RAISE EXCEPTION 'Only site owners can log actions';
  END IF;

  INSERT INTO owner_audit_log (owner_id, action_type, target_user_id, details)
  VALUES (auth.uid(), action_type_param, target_user_id_param, details_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION log_owner_action(text, uuid, jsonb) TO authenticated;
