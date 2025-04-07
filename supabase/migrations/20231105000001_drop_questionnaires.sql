-- Down migration for questionnaire system
-- This will drop all tables, policies and triggers related to questionnaires

-- Drop policies
DROP POLICY IF EXISTS "Users can update their own responses" ON responses;
DROP POLICY IF EXISTS "Users can view their own responses" ON responses;
DROP POLICY IF EXISTS "Users can submit their own responses" ON responses;

DROP POLICY IF EXISTS "Trainers can delete their assignments" ON questionnaire_assignments;
DROP POLICY IF EXISTS "Trainers can manage their assignments" ON questionnaire_assignments;
DROP POLICY IF EXISTS "Users can view their assignments" ON questionnaire_assignments;
DROP POLICY IF EXISTS "Trainers can assign questionnaires" ON questionnaire_assignments;

DROP POLICY IF EXISTS "Users can view questions for assigned questionnaires" ON questions;
DROP POLICY IF EXISTS "Trainers can manage questions for their questionnaires" ON questions;

DROP POLICY IF EXISTS "Trainers can delete their own questionnaires" ON questionnaires;
DROP POLICY IF EXISTS "Trainers can update their own questionnaires" ON questionnaires;
DROP POLICY IF EXISTS "Users can view questionnaires they created or are assigned to" ON questionnaires;
DROP POLICY IF EXISTS "Trainers can create questionnaires" ON questionnaires;

-- Drop triggers
DROP TRIGGER IF EXISTS update_questionnaire_timestamp ON questionnaires;

-- Drop functions
DROP FUNCTION IF EXISTS update_questionnaire_updated_at();

-- Drop tables (in reverse order to avoid foreign key constraints)
DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS questionnaire_assignments;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS questionnaires; 