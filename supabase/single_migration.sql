-- Complete database schema in a single file
-- This file contains all database structures, policies, and functions

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PROFILES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('trainer', 'athlete')),
  username text UNIQUE,
  first_name text, 
  last_name text,
  has_seen_welcome boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Function for welcome message preference
CREATE OR REPLACE FUNCTION update_welcome_message_preference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.has_seen_welcome = COALESCE(NEW.has_seen_welcome, OLD.has_seen_welcome, FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for welcome message preference
CREATE TRIGGER preserve_welcome_message_preference
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_welcome_message_preference();

-- ==========================================
-- QUESTIONNAIRES SYSTEM
-- ==========================================

-- 1. Questionnaires table - stores basic questionnaire information
CREATE TABLE IF NOT EXISTS questionnaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Questions table - stores individual questions belonging to questionnaires
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('short_text', 'long_text', 'number', 'scale')),
  question_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- To ensure questions are ordered correctly within a questionnaire
  UNIQUE (questionnaire_id, question_order)
);

-- 3. Questionnaire assignments table - links questionnaires to users
CREATE TABLE IF NOT EXISTS questionnaire_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date TIMESTAMP WITH TIME ZONE,
  
  -- Prevent duplicate assignments of the same questionnaire to the same user
  UNIQUE (questionnaire_id, assigned_to)
);

-- 4. Responses table - stores user answers to questions
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES questionnaire_assignments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  response_text TEXT,
  response_number NUMERIC,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Each question in an assignment can only have one response per user
  UNIQUE (question_id, assignment_id, user_id)
);

-- Update timestamp function for questionnaires
CREATE OR REPLACE FUNCTION update_questionnaire_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for questionnaire timestamp updates
CREATE TRIGGER update_questionnaire_timestamp
BEFORE UPDATE ON questionnaires
FOR EACH ROW
EXECUTE FUNCTION update_questionnaire_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_questionnaire_id ON questions(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_assignments_questionnaire_id ON questionnaire_assignments(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_to ON questionnaire_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_responses_assignment_id ON responses(assignment_id);
CREATE INDEX IF NOT EXISTS idx_responses_user_id ON responses(user_id);

-- Enable RLS (Row Level Security) for questionnaire-related tables
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Questionnaires policies
CREATE POLICY "Trainers can create questionnaires" ON questionnaires 
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'trainer'
  ));

CREATE POLICY "Users can view questionnaires they created or are assigned to" ON questionnaires 
  FOR SELECT USING (
    created_by = auth.uid() OR 
    auth.uid() IN (
      SELECT assigned_to FROM questionnaire_assignments WHERE questionnaire_id = id
    )
  );

CREATE POLICY "Trainers can update their own questionnaires" ON questionnaires 
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Trainers can delete their own questionnaires" ON questionnaires 
  FOR DELETE USING (created_by = auth.uid());

-- Questions policies
CREATE POLICY "Trainers can insert questions for their questionnaires" ON questions 
  FOR INSERT WITH CHECK (
    questionnaire_id IN (
      SELECT id FROM questionnaires WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Trainers can update questions for their questionnaires" ON questions 
  FOR UPDATE USING (
    questionnaire_id IN (
      SELECT id FROM questionnaires WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Trainers can delete questions for their questionnaires" ON questions 
  FOR DELETE USING (
    questionnaire_id IN (
      SELECT id FROM questionnaires WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view questions for their questionnaires" ON questions 
  FOR SELECT USING (
    questionnaire_id IN (
      SELECT q.id FROM questionnaires q
      WHERE q.created_by = auth.uid()
      OR q.id IN (
        SELECT a.questionnaire_id FROM questionnaire_assignments a
        WHERE a.assigned_to = auth.uid()
      )
    )
  );

-- Assignments policies
CREATE POLICY "Trainers can assign questionnaires" ON questionnaire_assignments 
  FOR INSERT WITH CHECK (
    assigned_by = auth.uid() AND
    questionnaire_id IN (
      SELECT id FROM questionnaires WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view their assignments" ON questionnaire_assignments 
  FOR SELECT USING (
    assigned_to = auth.uid() OR assigned_by = auth.uid()
  );

CREATE POLICY "Trainers can manage their assignments" ON questionnaire_assignments 
  FOR UPDATE USING (assigned_by = auth.uid());

CREATE POLICY "Trainers can delete their assignments" ON questionnaire_assignments 
  FOR DELETE USING (assigned_by = auth.uid());

-- Responses policies
CREATE POLICY "Users can submit their own responses" ON responses 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own responses" ON responses 
  FOR SELECT USING (
    user_id = auth.uid() OR
    assignment_id IN (
      SELECT id FROM questionnaire_assignments WHERE assigned_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own responses" ON responses 
  FOR UPDATE USING (user_id = auth.uid());

-- ==========================================
-- TRAINER-ATHLETE RELATIONSHIP
-- ==========================================

-- Trainer-Athlete relationships
CREATE TABLE IF NOT EXISTS trainer_athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  athlete_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate relationships
  UNIQUE(trainer_id, athlete_id)
);

-- Enable RLS on trainer_athletes table
ALTER TABLE trainer_athletes ENABLE ROW LEVEL SECURITY;

-- Policies for trainer_athletes table
CREATE POLICY "Trainers can create connections" ON trainer_athletes
  FOR INSERT WITH CHECK (
    trainer_id = auth.uid() AND
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'trainer')
  );

CREATE POLICY "Users can see their own connections" ON trainer_athletes
  FOR SELECT USING (
    trainer_id = auth.uid() OR athlete_id = auth.uid()
  );

CREATE POLICY "Users can update their own connections" ON trainer_athletes
  FOR UPDATE USING (
    trainer_id = auth.uid() OR athlete_id = auth.uid()
  );

CREATE POLICY "Users can delete their own connections" ON trainer_athletes
  FOR DELETE USING (
    trainer_id = auth.uid() OR athlete_id = auth.uid()
  );

-- ==========================================
-- WORKOUTS SYSTEM
-- ==========================================

-- 1. Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  rest_time INTEGER, -- in seconds
  exercise_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Each exercise in a workout must have a unique order
  UNIQUE(workout_id, exercise_order)
);

-- 3. Workout assignments table
CREATE TABLE IF NOT EXISTS workout_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Prevent duplicate assignments of the same workout to the same user
  UNIQUE(workout_id, assigned_to)
);

-- Enable RLS on workout tables
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_assignments ENABLE ROW LEVEL SECURITY;

-- Update timestamp function for workouts
CREATE OR REPLACE FUNCTION update_workout_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for workout timestamp updates
CREATE TRIGGER update_workout_timestamp
BEFORE UPDATE ON workouts
FOR EACH ROW
EXECUTE FUNCTION update_workout_updated_at();

-- Workout policies
CREATE POLICY "Trainers can create workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'trainer'
  ));

CREATE POLICY "Users can view workouts they created or are assigned to" ON workouts
  FOR SELECT USING (
    created_by = auth.uid() OR
    auth.uid() IN (
      SELECT assigned_to FROM workout_assignments WHERE workout_id = id
    )
  );

CREATE POLICY "Trainers can update their own workouts" ON workouts
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Trainers can delete their own workouts" ON workouts
  FOR DELETE USING (created_by = auth.uid());

-- Exercise policies
CREATE POLICY "Trainers can insert exercises for their workouts" ON exercises
  FOR INSERT WITH CHECK (
    workout_id IN (
      SELECT id FROM workouts WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view exercises for workouts they can access" ON exercises
  FOR SELECT USING (
    workout_id IN (
      SELECT w.id FROM workouts w
      WHERE w.created_by = auth.uid()
      OR w.id IN (
        SELECT a.workout_id FROM workout_assignments a
        WHERE a.assigned_to = auth.uid()
      )
    )
  );

CREATE POLICY "Trainers can update exercises for their workouts" ON exercises
  FOR UPDATE USING (
    workout_id IN (
      SELECT id FROM workouts WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Trainers can delete exercises for their workouts" ON exercises
  FOR DELETE USING (
    workout_id IN (
      SELECT id FROM workouts WHERE created_by = auth.uid()
    )
  );

-- Workout assignment policies
CREATE POLICY "Trainers can assign workouts" ON workout_assignments
  FOR INSERT WITH CHECK (
    assigned_by = auth.uid() AND
    workout_id IN (
      SELECT id FROM workouts WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view their workout assignments" ON workout_assignments
  FOR SELECT USING (
    assigned_to = auth.uid() OR assigned_by = auth.uid()
  );

CREATE POLICY "Users can update their workout status" ON workout_assignments
  FOR UPDATE USING (
    assigned_to = auth.uid() OR assigned_by = auth.uid()
  );

CREATE POLICY "Trainers can delete their workout assignments" ON workout_assignments
  FOR DELETE USING (assigned_by = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_assignments_workout_id ON workout_assignments(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_assignments_assigned_to ON workout_assignments(assigned_to); 