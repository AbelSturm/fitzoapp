-- Create the trainer_athletes table
CREATE TABLE IF NOT EXISTS public.trainer_athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active', -- pending, active, inactive
    
    -- Enforce uniqueness of trainer-athlete relationship
    CONSTRAINT unique_trainer_athlete UNIQUE (trainer_id, athlete_id)
);

-- Create a function to validate trainer and athlete roles
CREATE OR REPLACE FUNCTION check_trainer_athlete_roles()
RETURNS TRIGGER AS $$
DECLARE
    trainer_role TEXT;
    athlete_role TEXT;
BEGIN
    -- Get trainer role
    SELECT role INTO trainer_role FROM public.profiles WHERE id = NEW.trainer_id;
    
    -- Get athlete role
    SELECT role INTO athlete_role FROM public.profiles WHERE id = NEW.athlete_id;
    
    -- Check if trainer has role 'trainer'
    IF trainer_role != 'trainer' THEN
        RAISE EXCEPTION 'User with ID % is not a trainer', NEW.trainer_id;
    END IF;
    
    -- Check if athlete has role 'athlete'
    IF athlete_role != 'athlete' THEN
        RAISE EXCEPTION 'User with ID % is not an athlete', NEW.athlete_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to check roles before insert or update
CREATE TRIGGER check_trainer_athlete_roles_trigger
BEFORE INSERT OR UPDATE ON public.trainer_athletes
FOR EACH ROW EXECUTE FUNCTION check_trainer_athlete_roles();

-- Add RLS policies
ALTER TABLE public.trainer_athletes ENABLE ROW LEVEL SECURITY;

-- Trainers can see their own athletes
CREATE POLICY "Trainers can see their own athletes" ON public.trainer_athletes
    FOR SELECT USING (auth.uid() = trainer_id);

-- Trainers can add athletes
CREATE POLICY "Trainers can add athletes" ON public.trainer_athletes
    FOR INSERT WITH CHECK (auth.uid() = trainer_id);

-- Trainers can update their athlete relationships
CREATE POLICY "Trainers can update their athlete relationships" ON public.trainer_athletes
    FOR UPDATE USING (auth.uid() = trainer_id);

-- Trainers can delete their athlete relationships
CREATE POLICY "Trainers can delete their athlete relationships" ON public.trainer_athletes
    FOR DELETE USING (auth.uid() = trainer_id);

-- Athletes can see trainers they're connected to
CREATE POLICY "Athletes can see their trainers" ON public.trainer_athletes
    FOR SELECT USING (auth.uid() = athlete_id);

-- Create function to get athletes for a trainer
CREATE OR REPLACE FUNCTION public.get_trainer_athletes(trainer_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email as name, -- Use email as name since there's no name column
        p.email,
        ta.created_at,
        ta.status
    FROM 
        profiles p
    JOIN 
        trainer_athletes ta ON p.id = ta.athlete_id
    WHERE 
        ta.trainer_id = trainer_uuid
    ORDER BY 
        p.email;
END;
$$;

-- Create function to get trainers for an athlete
CREATE OR REPLACE FUNCTION public.get_athlete_trainers(athlete_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email as name, -- Use email as name since there's no name column
        p.email,
        ta.created_at,
        ta.status
    FROM 
        profiles p
    JOIN 
        trainer_athletes ta ON p.id = ta.trainer_id
    WHERE 
        ta.athlete_id = athlete_uuid
    ORDER BY 
        p.email;
END;
$$; 