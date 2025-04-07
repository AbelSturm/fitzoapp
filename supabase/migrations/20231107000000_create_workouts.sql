-- Create the workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    rest INTEGER NOT NULL, -- in seconds
    notes TEXT,
    exercise_order INTEGER NOT NULL
);

-- Create the workout_assignments table
CREATE TABLE IF NOT EXISTS public.workout_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, canceled
    due_date TIMESTAMPTZ,
    
    -- Enforce uniqueness of workout-athlete assignment
    CONSTRAINT unique_workout_assignment UNIQUE (workout_id, assigned_to)
);

-- Add RLS policies
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_assignments ENABLE ROW LEVEL SECURITY;

-- Workouts policies
CREATE POLICY "Trainers can create workouts" ON public.workouts
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Trainers can see their own workouts" ON public.workouts
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Trainers can update their own workouts" ON public.workouts
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Trainers can delete their own workouts" ON public.workouts
    FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Athletes can see workouts assigned to them" ON public.workouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workout_assignments 
            WHERE workout_id = id AND assigned_to = auth.uid()
        )
    );

-- Exercises policies
CREATE POLICY "Trainers can create exercises" ON public.exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workouts 
            WHERE id = workout_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Trainers can see exercises for their workouts" ON public.exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workouts 
            WHERE id = workout_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Trainers can update exercises for their workouts" ON public.exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.workouts 
            WHERE id = workout_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Trainers can delete exercises for their workouts" ON public.exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.workouts 
            WHERE id = workout_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Athletes can see exercises for workouts assigned to them" ON public.exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workout_assignments 
            WHERE workout_id = workout_id AND assigned_to = auth.uid()
        )
    );

-- Workout assignments policies
CREATE POLICY "Trainers can assign workouts" ON public.workout_assignments
    FOR INSERT WITH CHECK (auth.uid() = assigned_by);

CREATE POLICY "Trainers can see their workout assignments" ON public.workout_assignments
    FOR SELECT USING (auth.uid() = assigned_by);

CREATE POLICY "Trainers can update their workout assignments" ON public.workout_assignments
    FOR UPDATE USING (auth.uid() = assigned_by);

CREATE POLICY "Trainers can delete their workout assignments" ON public.workout_assignments
    FOR DELETE USING (auth.uid() = assigned_by);

CREATE POLICY "Athletes can see workouts assigned to them" ON public.workout_assignments
    FOR SELECT USING (auth.uid() = assigned_to);

CREATE POLICY "Athletes can update their workout assignments" ON public.workout_assignments
    FOR UPDATE 
    USING (auth.uid() = assigned_to)
    WITH CHECK (
        status = 'completed' OR status = 'canceled'
    );

-- Create functions to get trainer and athlete workouts
CREATE OR REPLACE FUNCTION public.get_trainer_workouts(trainer_uuid UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    created_at TIMESTAMPTZ,
    exercise_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.title,
        w.description,
        w.created_at,
        COUNT(e.id) AS exercise_count
    FROM 
        workouts w
    LEFT JOIN 
        exercises e ON w.id = e.workout_id
    WHERE 
        w.created_by = trainer_uuid
    GROUP BY 
        w.id, w.title, w.description, w.created_at
    ORDER BY 
        w.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_athlete_workouts(athlete_uuid UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    assigned_at TIMESTAMPTZ,
    status TEXT,
    due_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.title,
        w.description,
        wa.assigned_at,
        wa.status,
        wa.due_date
    FROM 
        workouts w
    JOIN 
        workout_assignments wa ON w.id = wa.workout_id
    WHERE 
        wa.assigned_to = athlete_uuid
    ORDER BY 
        wa.assigned_at DESC;
END;
$$; 