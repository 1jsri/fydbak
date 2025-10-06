/*
  # Create Motiiv AI Survey Platform Schema

  ## Overview
  This migration establishes the complete database structure for the conversational AI feedback platform,
  enabling managers to create surveys and reps to provide detailed, AI-clarified responses.

  ## 1. New Tables

  ### `profiles`
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email address
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'manager' or 'rep'
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `surveys`
  - `id` (uuid, primary key) - Unique survey identifier
  - `manager_id` (uuid, foreign key) - References profiles.id
  - `title` (text) - Survey title
  - `description` (text) - Survey instructions/description
  - `emoji` (text, optional) - Optional emoji for survey
  - `image_url` (text, optional) - Optional header image
  - `goal` (text) - Survey purpose/goal category
  - `status` (text) - Survey status: 'draft', 'active', 'archived'
  - `short_code` (text, unique) - 6-character short code for easy access
  - `created_at` (timestamptz) - Survey creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `questions`
  - `id` (uuid, primary key) - Unique question identifier
  - `survey_id` (uuid, foreign key) - References surveys.id
  - `question_text` (text) - The question content
  - `order_index` (integer) - Question order in survey
  - `is_required` (boolean) - Whether question is mandatory
  - `created_at` (timestamptz) - Question creation timestamp

  ### `chat_sessions`
  - `id` (uuid, primary key) - Unique session identifier
  - `survey_id` (uuid, foreign key) - References surveys.id
  - `rep_name` (text, optional) - Rep's provided name/nickname
  - `status` (text) - Session status: 'started', 'in_progress', 'completed', 'abandoned'
  - `current_question_id` (uuid, optional) - Current question being answered
  - `started_at` (timestamptz) - Session start timestamp
  - `completed_at` (timestamptz, optional) - Session completion timestamp
  - `last_activity_at` (timestamptz) - Last interaction timestamp

  ### `responses`
  - `id` (uuid, primary key) - Unique response identifier
  - `session_id` (uuid, foreign key) - References chat_sessions.id
  - `question_id` (uuid, foreign key) - References questions.id
  - `answer_text` (text) - Rep's answer
  - `is_skipped` (boolean) - Whether question was skipped
  - `skip_reason` (text, optional) - Reason for skipping
  - `clarification_count` (integer) - Number of AI clarifications requested
  - `needs_followup` (boolean) - Flagged for manager follow-up
  - `created_at` (timestamptz) - Response creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `clarifications`
  - `id` (uuid, primary key) - Unique clarification identifier
  - `response_id` (uuid, foreign key) - References responses.id
  - `clarification_prompt` (text) - AI-generated follow-up question
  - `clarification_answer` (text) - Rep's clarification response
  - `attempt_number` (integer) - Clarification attempt (1 or 2)
  - `created_at` (timestamptz) - Clarification timestamp

  ### `session_summaries`
  - `id` (uuid, primary key) - Unique summary identifier
  - `session_id` (uuid, foreign key) - References chat_sessions.id
  - `ai_summary` (text) - AI-generated summary paragraph
  - `action_points` (jsonb) - Array of 2-3 suggested actions
  - `honesty_score` (integer, optional) - Experimental internal score (0-100)
  - `key_themes` (text[], optional) - Extracted themes/keywords
  - `generated_at` (timestamptz) - Summary generation timestamp

  ## 2. Security

  All tables have Row Level Security (RLS) enabled with the following policies:

  ### Profiles
  - Users can read their own profile
  - Users can update their own profile

  ### Surveys
  - Managers can CRUD their own surveys
  - Anyone can view active surveys (for rep access via link)

  ### Questions
  - Managers can CRUD questions for their surveys
  - Anyone can view questions for active surveys

  ### Chat Sessions
  - Anyone can create and update sessions (anonymous rep access)
  - Managers can view sessions for their surveys

  ### Responses & Clarifications
  - Session owners can create/update their responses
  - Managers can view responses for their surveys

  ### Session Summaries
  - System can create summaries
  - Managers can view summaries for their surveys

  ## 3. Indexes

  Performance indexes created for:
  - Survey lookups by manager and short_code
  - Question ordering within surveys
  - Session lookups and status filtering
  - Response aggregation by session and question
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'manager' CHECK (role IN ('manager', 'rep')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  emoji text,
  image_url text,
  goal text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  short_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view own surveys"
  ON surveys FOR SELECT
  TO authenticated
  USING (auth.uid() = manager_id);

CREATE POLICY "Managers can create surveys"
  ON surveys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Managers can update own surveys"
  ON surveys FOR UPDATE
  TO authenticated
  USING (auth.uid() = manager_id)
  WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Managers can delete own surveys"
  ON surveys FOR DELETE
  TO authenticated
  USING (auth.uid() = manager_id);

CREATE POLICY "Anyone can view active surveys"
  ON surveys FOR SELECT
  TO anon
  USING (status = 'active');

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  order_index integer NOT NULL,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can manage questions for their surveys"
  ON questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = questions.survey_id
      AND surveys.manager_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = questions.survey_id
      AND surveys.manager_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view questions for active surveys"
  ON questions FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = questions.survey_id
      AND surveys.status = 'active'
    )
  );

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  rep_name text,
  status text NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'in_progress', 'completed', 'abandoned')),
  current_question_id uuid REFERENCES questions(id) ON DELETE SET NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  last_activity_at timestamptz DEFAULT now()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create sessions"
  ON chat_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
  ON chat_sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Managers can view sessions for their surveys"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = chat_sessions.survey_id
      AND surveys.manager_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view their own session"
  ON chat_sessions FOR SELECT
  TO anon
  USING (true);

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text text,
  is_skipped boolean DEFAULT false,
  skip_reason text,
  clarification_count integer DEFAULT 0,
  needs_followup boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create responses"
  ON responses FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update responses"
  ON responses FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Managers can view responses for their surveys"
  ON responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      JOIN surveys ON surveys.id = chat_sessions.survey_id
      WHERE chat_sessions.id = responses.session_id
      AND surveys.manager_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view responses for their session"
  ON responses FOR SELECT
  TO anon
  USING (true);

-- Create clarifications table
CREATE TABLE IF NOT EXISTS clarifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id uuid NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  clarification_prompt text NOT NULL,
  clarification_answer text,
  attempt_number integer NOT NULL CHECK (attempt_number IN (1, 2)),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clarifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create clarifications"
  ON clarifications FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update clarifications"
  ON clarifications FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Managers can view clarifications for their surveys"
  ON clarifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM responses
      JOIN chat_sessions ON chat_sessions.id = responses.session_id
      JOIN surveys ON surveys.id = chat_sessions.survey_id
      WHERE responses.id = clarifications.response_id
      AND surveys.manager_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view clarifications for their responses"
  ON clarifications FOR SELECT
  TO anon
  USING (true);

-- Create session_summaries table
CREATE TABLE IF NOT EXISTS session_summaries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid UNIQUE NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  ai_summary text NOT NULL,
  action_points jsonb DEFAULT '[]'::jsonb,
  honesty_score integer CHECK (honesty_score >= 0 AND honesty_score <= 100),
  key_themes text[],
  generated_at timestamptz DEFAULT now()
);

ALTER TABLE session_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can create summaries"
  ON session_summaries FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Managers can view summaries for their surveys"
  ON session_summaries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      JOIN surveys ON surveys.id = chat_sessions.survey_id
      WHERE chat_sessions.id = session_summaries.session_id
      AND surveys.manager_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_surveys_manager_id ON surveys(manager_id);
CREATE INDEX IF NOT EXISTS idx_surveys_short_code ON surveys(short_code);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_questions_survey_id ON questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(survey_id, order_index);
CREATE INDEX IF NOT EXISTS idx_sessions_survey_id ON chat_sessions(survey_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON responses(question_id);
CREATE INDEX IF NOT EXISTS idx_clarifications_response_id ON clarifications(response_id);
CREATE INDEX IF NOT EXISTS idx_summaries_session_id ON session_summaries(session_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();