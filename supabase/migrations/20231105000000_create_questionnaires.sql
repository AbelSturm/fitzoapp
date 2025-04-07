-- Create questionnaire system (up migration)
-- Description: Sets up tables for questionnaires, questions, assignments, and responses

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

----------------
-- Create tables
----------------

-- Check if tables already exist before creating
DO $$
BEGIN
    -- 1. Questionnaires table - stores basic questionnaire information
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'questionnaires') THEN
        CREATE TABLE questionnaires (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT,
          created_by UUID REFERENCES auth.users(id) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- 2. Questions table - stores individual questions belonging to questionnaires
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'questions') THEN
        CREATE TABLE questions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE NOT NULL,
          text TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('short_text', 'long_text', 'number', 'scale')),
          question_order INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          -- To ensure questions are ordered correctly within a questionnaire
          UNIQUE (questionnaire_id, question_order)
        );
    END IF;

    -- 3. Questionnaire assignments table - links questionnaires to users
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'questionnaire_assignments') THEN
        CREATE TABLE questionnaire_assignments (
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
    END IF;

    -- 4. Responses table - stores user answers to questions
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'responses') THEN
        CREATE TABLE responses (
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
    END IF;
END
$$;

---------------------
-- Create functions
---------------------

-- Create function only if it doesn't exist
CREATE OR REPLACE FUNCTION update_questionnaire_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_trigger 
        WHERE tgname = 'update_questionnaire_timestamp'
    ) THEN
        CREATE TRIGGER update_questionnaire_timestamp
        BEFORE UPDATE ON questionnaires
        FOR EACH ROW
        EXECUTE FUNCTION update_questionnaire_updated_at();
    END IF;
END
$$;

---------------------
-- Create indexes
---------------------

-- Create indexes only if they don't exist
DO $$
BEGIN
    -- Create indexes for performance
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_questions_questionnaire_id') THEN
        CREATE INDEX idx_questions_questionnaire_id ON questions(questionnaire_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_assignments_questionnaire_id') THEN
        CREATE INDEX idx_assignments_questionnaire_id ON questionnaire_assignments(questionnaire_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_assignments_assigned_to') THEN
        CREATE INDEX idx_assignments_assigned_to ON questionnaire_assignments(assigned_to);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_responses_assignment_id') THEN
        CREATE INDEX idx_responses_assignment_id ON responses(assignment_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_responses_user_id') THEN
        CREATE INDEX idx_responses_user_id ON responses(user_id);
    END IF;
END
$$;

---------------------
-- Set up security
---------------------

-- Enable RLS (Row Level Security) for all tables
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
    -- Questionnaires policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'questionnaires' AND policyname = 'Trainers can create questionnaires') THEN
        CREATE POLICY "Trainers can create questionnaires" ON questionnaires 
          FOR INSERT WITH CHECK (auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'trainer'
          ));
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'questionnaires' AND policyname = 'Users can view questionnaires they created or are assigned to') THEN
        CREATE POLICY "Users can view questionnaires they created or are assigned to" ON questionnaires 
          FOR SELECT USING (
            created_by = auth.uid() OR 
            auth.uid() IN (
              SELECT assigned_to FROM questionnaire_assignments WHERE questionnaire_id = id
            )
          );
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'questionnaires' AND policyname = 'Trainers can update their own questionnaires') THEN
        CREATE POLICY "Trainers can update their own questionnaires" ON questionnaires 
          FOR UPDATE USING (created_by = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'questionnaires' AND policyname = 'Trainers can delete their own questionnaires') THEN
        CREATE POLICY "Trainers can delete their own questionnaires" ON questionnaires 
          FOR DELETE USING (created_by = auth.uid());
    END IF;

    -- Questions policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'questions' AND policyname = 'Trainers can insert questions for their questionnaires') THEN
        CREATE POLICY "Trainers can insert questions for their questionnaires" ON questions 
          FOR INSERT WITH CHECK (
            questionnaire_id IN (
              SELECT id FROM questionnaires WHERE created_by = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'questions' AND policyname = 'Trainers can update questions for their questionnaires') THEN
        CREATE POLICY "Trainers can update questions for their questionnaires" ON questions 
          FOR UPDATE USING (
            questionnaire_id IN (
              SELECT id FROM questionnaires WHERE created_by = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'questions' AND policyname = 'Trainers can delete questions for their questionnaires') THEN
        CREATE POLICY "Trainers can delete questions for their questionnaires" ON questions 
          FOR DELETE USING (
            questionnaire_id IN (
              SELECT id FROM questionnaires WHERE created_by = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'questions' AND policyname = 'Users can view questions for their questionnaires') THEN
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
    END IF;

    -- Assignments policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'questionnaire_assignments' AND policyname = 'Trainers can assign questionnaires') THEN
        CREATE POLICY "Trainers can assign questionnaires" ON questionnaire_assignments 
          FOR INSERT WITH CHECK (
            assigned_by = auth.uid() AND
            questionnaire_id IN (
              SELECT id FROM questionnaires WHERE created_by = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'questionnaire_assignments' AND policyname = 'Users can view their assignments') THEN
        CREATE POLICY "Users can view their assignments" ON questionnaire_assignments 
          FOR SELECT USING (
            assigned_to = auth.uid() OR assigned_by = auth.uid()
          );
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'questionnaire_assignments' AND policyname = 'Trainers can manage their assignments') THEN
        CREATE POLICY "Trainers can manage their assignments" ON questionnaire_assignments 
          FOR UPDATE USING (assigned_by = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'questionnaire_assignments' AND policyname = 'Trainers can delete their assignments') THEN
        CREATE POLICY "Trainers can delete their assignments" ON questionnaire_assignments 
          FOR DELETE USING (assigned_by = auth.uid());
    END IF;

    -- Responses policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'responses' AND policyname = 'Users can submit their own responses') THEN
        CREATE POLICY "Users can submit their own responses" ON responses 
          FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'responses' AND policyname = 'Users can view their own responses') THEN
        CREATE POLICY "Users can view their own responses" ON responses 
          FOR SELECT USING (
            user_id = auth.uid() OR
            assignment_id IN (
              SELECT id FROM questionnaire_assignments WHERE assigned_by = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'responses' AND policyname = 'Users can update their own responses') THEN
        CREATE POLICY "Users can update their own responses" ON responses 
          FOR UPDATE USING (user_id = auth.uid());
    END IF;
END
$$;

-- Down migration (if needed to roll back)
-- Just add a comment for now, as you typically don't include this in the same file
-- To roll back, you would DROP the tables in reverse order of creation
-- DROP TABLE IF EXISTS responses;
-- DROP TABLE IF EXISTS questionnaire_assignments;
-- DROP TABLE IF EXISTS questions;
-- DROP TABLE IF EXISTS questionnaires; 