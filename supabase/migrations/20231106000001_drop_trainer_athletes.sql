-- Drop functions first (they depend on the table)
DROP FUNCTION IF EXISTS public.get_trainer_athletes;
DROP FUNCTION IF EXISTS public.get_athlete_trainers;

-- Drop policies
DROP POLICY IF EXISTS "Trainers can see their own athletes" ON public.trainer_athletes;
DROP POLICY IF EXISTS "Trainers can add athletes" ON public.trainer_athletes;
DROP POLICY IF EXISTS "Trainers can update their athlete relationships" ON public.trainer_athletes;
DROP POLICY IF EXISTS "Trainers can delete their athlete relationships" ON public.trainer_athletes;
DROP POLICY IF EXISTS "Athletes can see their trainers" ON public.trainer_athletes;

-- Drop triggers
DROP TRIGGER IF EXISTS check_trainer_athlete_roles_trigger ON public.trainer_athletes;

-- Drop the trainer_athletes table
DROP TABLE IF EXISTS public.trainer_athletes;

-- Drop trigger function
DROP FUNCTION IF EXISTS check_trainer_athlete_roles; 