/*
  # Add Survey Duration and Closure Management

  ## Overview
  This migration adds survey lifecycle management features including timed surveys,
  manual closure, and automatic expiration tracking.

  ## 1. New Columns - surveys table

  ### Duration and Closure Fields
  - `duration_type` (text) - Type of duration: 'hours', 'days', 'indefinite'
  - `duration_value` (integer, nullable) - Duration amount (1-72 for hours, 1-30 for days)
  - `closes_at` (timestamptz, nullable) - Calculated timestamp when survey should close
  - `closed_manually` (boolean) - Whether survey was closed manually by manager
  - `closed_at` (timestamptz, nullable) - Actual timestamp when survey was closed
  - `closed_by` (uuid, nullable) - Manager who closed the survey manually

  ### PII and Export Fields
  - `collects_pii` (boolean) - Whether survey collects personally identifiable information
  - `pii_purpose` (text, nullable) - Purpose for PII collection (e.g., 'giveaway', 'follow_up')
  
  ## 2. New Tables

  ### feature_waitlist
  - `id` (uuid, primary key) - Unique waitlist entry identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `feature_name` (text) - Name of feature (e.g., 'respondent_export')
  - `email` (text) - Contact email for notification
  - `notes` (text, nullable) - Additional notes from user
  - `created_at` (timestamptz) - When user joined waitlist

  ## 3. Functions

  ### check_survey_expired
  Returns boolean indicating if survey has expired based on closes_at timestamp

  ### auto_close_expired_surveys
  Automatically closes surveys that have passed their closes_at time

  ## 4. Security

  All tables maintain Row Level Security with appropriate policies

  ## 5. Indexes

  Performance indexes added for survey status and closure queries
*/

-- Add new columns to surveys table
ALTER TABLE surveys
ADD COLUMN IF NOT EXISTS duration_type text DEFAULT 'indefinite' CHECK (duration_type IN ('hours', 'days', 'indefinite')),
ADD COLUMN IF NOT EXISTS duration_value integer CHECK (duration_value > 0),
ADD COLUMN IF NOT EXISTS closes_at timestamptz,
ADD COLUMN IF NOT EXISTS closed_manually boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS closed_at timestamptz,
ADD COLUMN IF NOT EXISTS closed_by uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS collects_pii boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pii_purpose text;

-- Update status enum to include 'closed'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'surveys_status_check'
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%closed%'
  ) THEN
    ALTER TABLE surveys DROP CONSTRAINT IF EXISTS surveys_status_check;
    ALTER TABLE surveys ADD CONSTRAINT surveys_status_check 
      CHECK (status IN ('draft', 'active', 'archived', 'closed'));
  END IF;
END $$;

-- Create feature waitlist table
CREATE TABLE IF NOT EXISTS feature_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_name text NOT NULL,
  email text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feature_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own waitlist entries"
  ON feature_waitlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own waitlist entries"
  ON feature_waitlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_surveys_closes_at ON surveys(closes_at) WHERE closes_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_surveys_status_active ON surveys(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_surveys_closed_at ON surveys(closed_at) WHERE closed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feature_waitlist_user ON feature_waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_waitlist_feature ON feature_waitlist(feature_name);

-- Function to check if survey has expired
CREATE OR REPLACE FUNCTION check_survey_expired(survey_id uuid)
RETURNS boolean AS $$
DECLARE
  survey_closes_at timestamptz;
  survey_status text;
BEGIN
  SELECT closes_at, status
  INTO survey_closes_at, survey_status
  FROM surveys
  WHERE id = survey_id;
  
  -- If no closes_at, survey doesn't expire
  IF survey_closes_at IS NULL THEN
    RETURN false;
  END IF;
  
  -- If already closed, return true
  IF survey_status = 'closed' THEN
    RETURN true;
  END IF;
  
  -- Check if current time is past closes_at
  RETURN now() >= survey_closes_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically close expired surveys
CREATE OR REPLACE FUNCTION auto_close_expired_surveys()
RETURNS integer AS $$
DECLARE
  closed_count integer := 0;
BEGIN
  -- Update all active surveys that have passed their closes_at time
  UPDATE surveys
  SET 
    status = 'closed',
    closed_at = now(),
    closed_manually = false
  WHERE 
    status = 'active'
    AND closes_at IS NOT NULL
    AND closes_at <= now();
  
  GET DIAGNOSTICS closed_count = ROW_COUNT;
  
  RETURN closed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually close a survey
CREATE OR REPLACE FUNCTION close_survey_manually(survey_id uuid, manager_id uuid)
RETURNS boolean AS $$
DECLARE
  survey_manager_id uuid;
BEGIN
  -- Verify the manager owns this survey
  SELECT manager_id INTO survey_manager_id
  FROM surveys
  WHERE id = survey_id;
  
  IF survey_manager_id != manager_id THEN
    RETURN false;
  END IF;
  
  -- Close the survey
  UPDATE surveys
  SET 
    status = 'closed',
    closed_at = now(),
    closed_manually = true,
    closed_by = manager_id
  WHERE id = survey_id AND status = 'active';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the feature
COMMENT ON COLUMN surveys.closes_at IS 'Timestamp when survey should automatically close. NULL means indefinite.';
COMMENT ON COLUMN surveys.collects_pii IS 'Whether survey collects PII (name, email, phone) for exports/giveaways';
COMMENT ON TABLE feature_waitlist IS 'Tracks user interest in upcoming features like respondent export';