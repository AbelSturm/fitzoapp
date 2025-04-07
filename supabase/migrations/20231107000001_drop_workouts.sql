-- Drop functions
DROP FUNCTION IF EXISTS public.get_trainer_workouts;
DROP FUNCTION IF EXISTS public.get_athlete_workouts;

-- Drop policies for workouts
DROP POLICY IF EXISTS "Trainers can create workouts" ON public.workouts;
DROP POLICY IF EXISTS "Trainers can see their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Trainers can update their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Trainers can delete their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Athletes can see workouts assigned to them" ON public.workouts;

-- Drop policies for exercises
DROP POLICY IF EXISTS "Trainers can create exercises" ON public.exercises;
DROP POLICY IF EXISTS "Trainers can see exercises for their workouts" ON public.exercises;
DROP POLICY IF EXISTS "Trainers can update exercises for their workouts" ON public.exercises;
DROP POLICY IF EXISTS "Trainers can delete exercises for their workouts" ON public.exercises;
DROP POLICY IF EXISTS "Athletes can see exercises for workouts assigned to them" ON public.exercises;

-- Drop policies for workout assignments
DROP POLICY IF EXISTS "Trainers can assign workouts" ON public.workout_assignments;
DROP POLICY IF EXISTS "Trainers can see their workout assignments" ON public.workout_assignments;
DROP POLICY IF EXISTS "Trainers can update their workout assignments" ON public.workout_assignments;
DROP POLICY IF EXISTS "Trainers can delete their workout assignments" ON public.workout_assignments;
DROP POLICY IF EXISTS "Athletes can see workouts assigned to them" ON public.workout_assignments;
DROP POLICY IF EXISTS "Athletes can update their workout assignments" ON public.workout_assignments;

-- Drop tables (in reverse order of creation to respect foreign key constraints)
DROP TABLE IF EXISTS public.workout_assignments;
DROP TABLE IF EXISTS public.exercises;
DROP TABLE IF EXISTS public.workouts; 