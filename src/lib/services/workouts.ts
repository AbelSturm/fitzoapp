import { supabase } from '$lib/supabaseClient';

export interface Exercise {
  id?: string;
  workout_id?: string;
  name: string;
  sets: number;
  reps: number;
  rest: number; // in seconds
  notes?: string;
  exercise_order: number;
}

export interface Workout {
  id?: string;
  title: string;
  description?: string;
  created_by?: string;
  created_at?: string;
  exercises?: Exercise[];
  exercise_count?: number;
}

export interface WorkoutAssignment {
  id?: string;
  workout_id: string;
  assigned_to: string;
  assigned_by?: string;
  assigned_at?: string;
  status?: 'pending' | 'completed' | 'canceled';
  due_date?: string;
  workout?: Workout;
  athlete?: {
    id: string;
    name: string;
    email: string;
  };
}

// Helper type for Supabase profile data
interface ProfileData {
  id: string;
  name: string;
  email: string;
}

interface WorkoutData {
  id: string;
  title: string;
  description: string;
  created_at: string;
  exercise_count: number;
  assigned_at?: string;
  status?: string;
  due_date?: string;
}

export const workoutsService = {
  /**
   * Creates a new workout with exercises
   * 
   * @param workoutData Workout data
   * @param exercises Array of exercises
   * @returns ID of the created workout, or empty string if failed
   */
  async createWorkout(workoutData: Workout, exercises: Exercise[]): Promise<string> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          title: workoutData.title,
          description: workoutData.description || '',
          created_by: user.id
        })
        .select('id')
        .single();
      
      if (workoutError) throw workoutError;
      
      const workoutId = workout.id;
      
      // Add exercises
      if (exercises.length > 0) {
        const exercisesWithId = exercises.map((exercise, index) => ({
          workout_id: workoutId,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          rest: exercise.rest,
          notes: exercise.notes || '',
          exercise_order: exercise.exercise_order || index + 1
        }));
        
        const { error: exercisesError } = await supabase
          .from('exercises')
          .insert(exercisesWithId);
        
        if (exercisesError) throw exercisesError;
      }
      
      return workoutId;
    } catch (error) {
      console.error('Error creating workout:', error);
      return '';
    }
  },

  /**
   * Gets all workouts created by the current user
   * 
   * @returns Array of workouts
   */
  async getTrainerWorkouts(): Promise<Workout[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Use the RPC function to get the workouts
      const { data, error } = await supabase.rpc('get_trainer_workouts', { 
        trainer_uuid: user.id 
      });
      
      if (error) throw error;
      
      // The RPC function returns data with exercise_count
      return (data || []).map((item: WorkoutData) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        created_at: item.created_at,
        exercise_count: item.exercise_count
      }));
    } catch (error) {
      console.error('Error getting trainer workouts:', error);
      return [];
    }
  },

  /**
   * Gets a single workout with its exercises
   * 
   * @param id Workout ID
   * @returns The workout with exercises or null if not found
   */
  async getWorkout(id: string): Promise<Workout | null> {
    try {
      // Get the workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (workoutError) throw workoutError;
      
      // Get the exercises
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('workout_id', id)
        .order('exercise_order', { ascending: true });
      
      if (exercisesError) throw exercisesError;
      
      return {
        ...workout,
        exercises: exercises || []
      };
    } catch (error) {
      console.error('Error getting workout:', error);
      return null;
    }
  },

  /**
   * Updates a workout and its exercises
   * 
   * @param workoutId ID of the workout to update
   * @param workoutData New workout data
   * @param exercises New exercises data
   * @returns Success status
   */
  async updateWorkout(
    workoutId: string,
    workoutData: Partial<Workout>,
    exercises: Exercise[]
  ): Promise<boolean> {
    try {
      // Update workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .update({
          title: workoutData.title,
          description: workoutData.description
        })
        .eq('id', workoutId);
      
      if (workoutError) throw workoutError;
      
      // Delete existing exercises
      const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .eq('workout_id', workoutId);
      
      if (deleteError) throw deleteError;
      
      // Re-insert exercises
      const exercisesWithId = exercises.map((e, index) => ({
        workout_id: workoutId,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        rest: e.rest,
        notes: e.notes || '',
        exercise_order: e.exercise_order || index + 1
      }));
      
      const { error: insertError } = await supabase
        .from('exercises')
        .insert(exercisesWithId);
      
      if (insertError) throw insertError;
      
      return true;
    } catch (error) {
      console.error('Error updating workout:', error);
      return false;
    }
  },

  /**
   * Deletes a workout and all related data
   * 
   * @param id Workout ID
   * @returns Success status
   */
  async deleteWorkout(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting workout:', error);
      return false;
    }
  },

  /**
   * Assigns a workout to multiple athletes
   * 
   * @param workoutId ID of the workout
   * @param athleteIds Array of athlete user IDs
   * @param dueDate Optional due date
   * @returns Success status
   */
  async assignWorkout(
    workoutId: string,
    athleteIds: string[],
    dueDate?: string
  ): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const assignments = athleteIds.map(athleteId => ({
        workout_id: workoutId,
        assigned_to: athleteId,
        assigned_by: user.id,
        due_date: dueDate || null
      }));
      
      const { error } = await supabase
        .from('workout_assignments')
        .insert(assignments);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error assigning workout:', error);
      return false;
    }
  },

  /**
   * Gets all athletes that a workout is assigned to
   * 
   * @param workoutId ID of the workout
   * @returns Array of assignments with athlete data
   */
  async getWorkoutAssignments(workoutId: string): Promise<WorkoutAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('workout_assignments')
        .select(`
          id,
          workout_id,
          assigned_to,
          assigned_by,
          assigned_at,
          status,
          due_date,
          profiles:assigned_to(id, name, email)
        `)
        .eq('workout_id', workoutId);
      
      if (error) throw error;
      
      // Format the returned data to match our interface
      return (data || []).map(item => {
        // Safely type the profile data
        const profile = item.profiles as unknown as ProfileData;
        
        return {
          id: item.id,
          workout_id: item.workout_id,
          assigned_to: item.assigned_to,
          assigned_by: item.assigned_by,
          assigned_at: item.assigned_at,
          status: item.status,
          due_date: item.due_date,
          athlete: profile ? {
            id: profile.id,
            name: profile.name,
            email: profile.email
          } : undefined
        };
      });
    } catch (error) {
      console.error('Error getting workout assignments:', error);
      return [];
    }
  },

  /**
   * Gets all workouts assigned to an athlete
   * 
   * @param athleteId ID of the athlete
   * @returns Array of assignments with workout data
   */
  async getAthleteWorkouts(athleteId?: string): Promise<WorkoutAssignment[]> {
    try {
      // If no athleteId provided, use current user
      let userId = athleteId;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        userId = user.id;
      }
      
      // Use the RPC function to get the workouts
      const { data, error } = await supabase.rpc('get_athlete_workouts', { 
        athlete_uuid: userId 
      });
      
      if (error) throw error;
      
      // Format the returned data to match our interface
      return (data || []).map((item: WorkoutData) => {
        return {
          workout_id: item.id,
          assigned_to: userId!,
          assigned_at: item.assigned_at,
          status: item.status,
          due_date: item.due_date,
          workout: {
            id: item.id,
            title: item.title,
            description: item.description,
            created_at: item.created_at
          }
        };
      });
    } catch (error) {
      console.error('Error getting athlete workouts:', error);
      return [];
    }
  },

  /**
   * Updates the status of a workout assignment
   * 
   * @param assignmentId ID of the assignment
   * @param status New status (pending, completed, canceled)
   * @returns Success status
   */
  async updateAssignmentStatus(
    assignmentId: string, 
    status: 'pending' | 'completed' | 'canceled'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_assignments')
        .update({ status })
        .eq('id', assignmentId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating assignment status:', error);
      return false;
    }
  }
}; 