import { supabase } from '$lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export type QuestionType = 'short_text' | 'long_text' | 'number' | 'scale';
export type AssignmentStatus = 'pending' | 'in_progress' | 'completed';

export interface Question {
  id?: string;
  questionnaire_id?: string;
  text: string;
  type: QuestionType;
  question_order: number;
  created_at?: string;
}

export interface Questionnaire {
  id?: string;
  title: string;
  description?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  questions?: Question[];
  question_count?: number;
}

export interface QuestionnaireAssignment {
  id?: string;
  questionnaire_id: string;
  assigned_to: string;
  assigned_by?: string;
  assigned_at?: string;
  status?: AssignmentStatus;
  due_date?: string;
  questionnaire?: Questionnaire;
  athlete?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface QuestionnaireResponse {
  id?: string;
  question_id: string;
  assignment_id: string;
  user_id?: string;
  response_text?: string;
  response_number?: number;
  submitted_at?: string;
  question?: Question;
}

// Helper types for Supabase responses
interface ProfileData {
  id: string;
  name: string;
  email: string;
}

interface QuestionData {
  id: string;
  text: string;
  type: QuestionType;
  question_order: number;
}

interface QuestionnaireData {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

/**
 * Service for interacting with questionnaires in Supabase
 */
export const questionnairesService = {
  /**
   * Creates a new questionnaire with questions
   * 
   * @param questionnaire The questionnaire data
   * @param questions Array of questions to add to the questionnaire
   * @returns The ID of the created questionnaire or empty string on error
   */
  async createQuestionnaire(questionnaire: Questionnaire, questions: Question[]): Promise<string> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Insert questionnaire
      const { data: questionnaireData, error: questionnaireError } = await supabase
        .from('questionnaires')
        .insert({
          title: questionnaire.title,
          description: questionnaire.description || null,
          created_by: user.id
        })
        .select('id')
        .single();

      if (questionnaireError) throw questionnaireError;
      
      const questionnaireId = questionnaireData.id;
      
      // Prepare questions with the questionnaire ID
      const questionsWithId = questions.map((q, index) => ({
        questionnaire_id: questionnaireId,
        text: q.text,
        type: q.type,
        question_order: q.question_order || index + 1
      }));
      
      // Insert questions
      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsWithId);
        
      if (questionsError) throw questionsError;
      
      return questionnaireId;
    } catch (error) {
      console.error('Error creating questionnaire:', error);
      return '';
    }
  },

  /**
   * Gets all questionnaires created by the current user
   * 
   * @returns Array of questionnaires with question counts
   */
  async getTrainerQuestionnaires(): Promise<Questionnaire[]> {
    try {
      // The Supabase count returns an array with a single object that has a count property
      // We need to handle this in our type definition
      interface QuestionsCount {
        count: number;
      }
      
      interface QuestionnaireWithCount {
        id: string;
        title: string;
        description: string | null;
        created_by: string;
        created_at: string;
        questions: QuestionsCount[];
      }

      const { data, error } = await supabase
        .from('questionnaires')
        .select(`
          id,
          title,
          description,
          created_by,
          created_at,
          questions(count)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform data to include questions count
      return (data as QuestionnaireWithCount[] || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || undefined,
        created_by: item.created_by,
        created_at: item.created_at,
        question_count: item.questions?.[0]?.count || 0
      }));
    } catch (error) {
      console.error('Error getting trainer questionnaires:', error);
      return [];
    }
  },

  /**
   * Gets a single questionnaire with its questions
   * 
   * @param id Questionnaire ID
   * @returns The questionnaire with questions or null if not found
   */
  async getQuestionnaire(id: string): Promise<Questionnaire | null> {
    try {
      // Get the questionnaire
      const { data: questionnaire, error: questionnaireError } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('id', id)
        .single();
      
      if (questionnaireError) throw questionnaireError;
      
      // Get the questions
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('questionnaire_id', id)
        .order('question_order', { ascending: true });
      
      if (questionsError) throw questionsError;
      
      return {
        ...questionnaire,
        questions: questions || []
      };
    } catch (error) {
      console.error('Error getting questionnaire:', error);
      return null;
    }
  },

  /**
   * Updates a questionnaire and its questions
   * 
   * @param questionnaireId ID of the questionnaire to update
   * @param questionnaireData New questionnaire data
   * @param questions New questions data
   * @returns Success status
   */
  async updateQuestionnaire(
    questionnaireId: string,
    questionnaireData: Partial<Questionnaire>,
    questions: Question[]
  ): Promise<boolean> {
    try {
      // Update questionnaire
      const { error: questionnaireError } = await supabase
        .from('questionnaires')
        .update({
          title: questionnaireData.title,
          description: questionnaireData.description
        })
        .eq('id', questionnaireId);
      
      if (questionnaireError) throw questionnaireError;
      
      // Delete existing questions
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('questionnaire_id', questionnaireId);
      
      if (deleteError) throw deleteError;
      
      // Re-insert questions
      const questionsWithId = questions.map((q, index) => ({
        questionnaire_id: questionnaireId,
        text: q.text,
        type: q.type,
        question_order: q.question_order || index + 1
      }));
      
      const { error: insertError } = await supabase
        .from('questions')
        .insert(questionsWithId);
      
      if (insertError) throw insertError;
      
      return true;
    } catch (error) {
      console.error('Error updating questionnaire:', error);
      return false;
    }
  },

  /**
   * Deletes a questionnaire and all related data
   * 
   * @param id Questionnaire ID
   * @returns Success status
   */
  async deleteQuestionnaire(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('questionnaires')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
      return false;
    }
  },

  /**
   * Assigns a questionnaire to multiple athletes
   * 
   * @param questionnaireId ID of the questionnaire
   * @param athleteIds Array of athlete user IDs
   * @param dueDate Optional due date
   * @returns Success status
   */
  async assignQuestionnaire(
    questionnaireId: string,
    athleteIds: string[],
    dueDate?: string
  ): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const assignments = athleteIds.map(athleteId => ({
        questionnaire_id: questionnaireId,
        assigned_to: athleteId,
        assigned_by: user.id,
        due_date: dueDate || null
      }));
      
      const { error } = await supabase
        .from('questionnaire_assignments')
        .insert(assignments);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error assigning questionnaire:', error);
      return false;
    }
  },

  /**
   * Gets all athletes that a questionnaire is assigned to
   * 
   * @param questionnaireId ID of the questionnaire
   * @returns Array of assignments with athlete data
   */
  async getQuestionnaireAssignments(questionnaireId: string): Promise<QuestionnaireAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('questionnaire_assignments')
        .select(`
          id,
          questionnaire_id,
          assigned_to,
          assigned_by,
          assigned_at,
          status,
          due_date,
          profiles:assigned_to(id, name, email)
        `)
        .eq('questionnaire_id', questionnaireId);
      
      if (error) throw error;
      
      // Format the returned data to match our interface
      return (data || []).map(item => {
        // Safely type the profile data
        const profile = item.profiles as unknown as ProfileData;
        
        return {
          id: item.id,
          questionnaire_id: item.questionnaire_id,
          assigned_to: item.assigned_to,
          assigned_by: item.assigned_by,
          assigned_at: item.assigned_at,
          status: item.status as AssignmentStatus,
          due_date: item.due_date,
          athlete: profile ? {
            id: profile.id,
            name: profile.name,
            email: profile.email
          } : undefined
        };
      });
    } catch (error) {
      console.error('Error getting questionnaire assignments:', error);
      return [];
    }
  },

  /**
   * Gets all questionnaires assigned to an athlete
   * 
   * @param athleteId ID of the athlete
   * @returns Array of assignments with questionnaire data
   */
  async getAthleteQuestionnaires(athleteId?: string): Promise<QuestionnaireAssignment[]> {
    try {
      // If no athleteId provided, use current user
      let userId = athleteId;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        userId = user.id;
      }
      
      const { data, error } = await supabase
        .from('questionnaire_assignments')
        .select(`
          id,
          questionnaire_id,
          assigned_to,
          assigned_by,
          assigned_at,
          status,
          due_date,
          questionnaire:questionnaire_id(
            id,
            title,
            description,
            created_at
          )
        `)
        .eq('assigned_to', userId)
        .order('assigned_at', { ascending: false });
      
      if (error) throw error;
      
      // Format the returned data to match our interface
      return (data || []).map(item => {
        // Safely type the questionnaire data
        const questionnaire = item.questionnaire as unknown as QuestionnaireData;
        
        return {
          id: item.id,
          questionnaire_id: item.questionnaire_id,
          assigned_to: item.assigned_to,
          assigned_by: item.assigned_by,
          assigned_at: item.assigned_at,
          status: item.status as AssignmentStatus,
          due_date: item.due_date,
          questionnaire: questionnaire ? {
            id: questionnaire.id,
            title: questionnaire.title,
            description: questionnaire.description || undefined,
            created_at: questionnaire.created_at
          } : undefined
        };
      });
    } catch (error) {
      console.error('Error getting athlete questionnaires:', error);
      return [];
    }
  },

  /**
   * Updates the status of a questionnaire assignment
   * 
   * @param assignmentId ID of the assignment
   * @param status New status value
   * @returns Success status
   */
  async updateAssignmentStatus(
    assignmentId: string, 
    status: AssignmentStatus
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('questionnaire_assignments')
        .update({ status })
        .eq('id', assignmentId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating assignment status:', error);
      return false;
    }
  },

  /**
   * Submits responses for a questionnaire assignment
   * 
   * @param assignmentId ID of the assignment
   * @param responses Array of response data for questions
   * @returns Success status
   */
  async submitResponses(
    assignmentId: string,
    responses: { questionId: string; text?: string; number?: number }[]
  ): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const formattedResponses = responses.map(r => ({
        assignment_id: assignmentId,
        question_id: r.questionId,
        user_id: user.id,
        response_text: r.text || null,
        response_number: r.number || null
      }));
      
      const { error } = await supabase
        .from('responses')
        .insert(formattedResponses);
      
      if (error) throw error;
      
      // Update assignment status to completed
      await this.updateAssignmentStatus(assignmentId, 'completed');
      
      return true;
    } catch (error) {
      console.error('Error submitting responses:', error);
      return false;
    }
  },

  /**
   * Gets all responses for a specific assignment
   * 
   * @param assignmentId ID of the assignment
   * @returns Array of responses with question data
   */
  async getAssignmentResponses(assignmentId: string): Promise<QuestionnaireResponse[]> {
    try {
      const { data, error } = await supabase
        .from('responses')
        .select(`
          id,
          question_id,
          assignment_id,
          user_id,
          response_text,
          response_number,
          submitted_at,
          question:question_id(id, text, type, question_order)
        `)
        .eq('assignment_id', assignmentId);
      
      if (error) throw error;
      
      // Format the returned data to match our interface
      return (data || []).map(item => {
        // Safely type the question data
        const question = item.question as unknown as QuestionData;
        
        return {
          id: item.id,
          question_id: item.question_id,
          assignment_id: item.assignment_id,
          user_id: item.user_id,
          response_text: item.response_text,
          response_number: item.response_number,
          submitted_at: item.submitted_at,
          question: question ? {
            id: question.id,
            text: question.text,
            type: question.type,
            question_order: question.question_order
          } : undefined
        };
      });
    } catch (error) {
      console.error('Error getting assignment responses:', error);
      return [];
    }
  },
  
  /**
   * Checks if a user has already submitted responses for an assignment
   * 
   * @param assignmentId ID of the assignment
   * @param userId Optional user ID (uses current user if not provided)
   * @returns True if responses exist
   */
  async hasSubmittedResponses(assignmentId: string, userId?: string): Promise<boolean> {
    try {
      // If no userId provided, use current user
      let currentUserId = userId;
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        currentUserId = user.id;
      }
      
      const { count, error } = await supabase
        .from('responses')
        .select('id', { count: 'exact' })
        .eq('assignment_id', assignmentId)
        .eq('user_id', currentUserId);
      
      if (error) throw error;
      return count !== null && count > 0;
    } catch (error) {
      console.error('Error checking for submitted responses:', error);
      return false;
    }
  }
};

export default questionnairesService; 