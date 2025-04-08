import { supabase } from '$lib/supabaseClient';

export interface Athlete {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
  status?: string;
}

export interface AthleteTrainerRelationship {
  id: string;
  trainer_id: string;
  athlete_id: string;
  created_at: string;
  status: string;
}

export const athletesService = {
  /**
   * Gets all athletes for the current trainer
   * 
   * @returns Array of athletes
   */
  async getTrainerAthletes(trainerId?: string): Promise<Athlete[]> {
    try {
      if (!trainerId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        trainerId = user.id;
      }
      
      const { data, error } = await supabase
        .rpc('get_trainer_athletes', { trainer_id: trainerId });
      
      if (error) throw error;
      
      // Interface to type the query result
      interface TrainerAthleteResult {
        athlete_id: string;
        created_at: string;
        profiles: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string;
        };
      }
      
      // Transform the data to match our Athlete interface
      const athletes: Athlete[] = data ? data.map((item: any) => {
        const profile = item.profiles;
        return {
          id: item.athlete_id,
          first_name: profile.first_name ?? undefined,
          last_name: profile.last_name ?? undefined,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          email: profile.email,
          created_at: item.created_at
        };
      }) : [];
      
      return athletes;
    } catch (error) {
      console.error('Error getting trainer athletes:', error);
      throw error;
    }
  },

  /**
   * Gets all trainers for the current athlete
   * 
   * @returns Array of trainers
   */
  async getAthleteTrainers(): Promise<Athlete[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Use the RPC function to get the trainers for this athlete
      const { data, error } = await supabase.rpc('get_athlete_trainers', { 
        athlete_uuid: user.id 
      });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting athlete trainers:', error);
      return [];
    }
  },

  /**
   * Add an athlete to the trainer's roster
   * 
   * @param athleteEmail Email of the athlete to add
   * @returns Success status
   */
  async addAthleteByEmail(athleteEmail: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // First, find the athlete by email
      const { data: athletes, error: athleteError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', athleteEmail)
        .eq('role', 'athlete')
        .single();
      
      if (athleteError || !athletes) {
        throw new Error('Athlete not found with that email');
      }
      
      // Then, add the relationship
      const { error } = await supabase
        .from('trainer_athletes')
        .insert({
          trainer_id: user.id,
          athlete_id: athletes.id
        });
      
      if (error) {
        // If the error is a unique violation, the athlete is already added
        if (error.code === '23505') {
          return true;
        }
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error adding athlete:', error);
      return false;
    }
  },

  /**
   * Removes an athlete from the trainer's roster
   * 
   * @param athleteId ID of the athlete to remove
   * @returns Success status
   */
  async removeAthlete(athleteId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('trainer_athletes')
        .delete()
        .eq('trainer_id', user.id)
        .eq('athlete_id', athleteId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing athlete:', error);
      return false;
    }
  },

  /**
   * Updates the status of an athlete relationship
   * 
   * @param athleteId ID of the athlete
   * @param status New status (active, inactive)
   * @returns Success status
   */
  async updateAthleteStatus(athleteId: string, status: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('trainer_athletes')
        .update({ status })
        .eq('trainer_id', user.id)
        .eq('athlete_id', athleteId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating athlete status:', error);
      return false;
    }
  },

  /**
   * Gets a list of all athletes available in the system
   * This can be used to find athletes to add to a trainer's roster
   * 
   * @param search Optional search term for finding athletes
   * @returns Array of athletes
   */
  async searchAthletes(search: string = ''): Promise<Athlete[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, email, created_at')
        .eq('role', 'athlete');
      
      // Add search if provided
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to include the name field
      return data ? data.map(profile => ({
        id: profile.id,
        first_name: profile.first_name || undefined,
        last_name: profile.last_name || undefined,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        email: profile.email,
        created_at: profile.created_at
      })) : [];
    } catch (error) {
      console.error('Error searching athletes:', error);
      return [];
    }
  }
};