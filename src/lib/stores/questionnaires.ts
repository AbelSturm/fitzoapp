import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { v4 as uuidv4 } from 'uuid';

// Types
export type QuestionType = 'short_text' | 'long_text' | 'number' | 'scale';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
}

export interface QuestionnaireResponse {
  id: string;
  questionId: string;
  athleteId: string;
  response: string;
  submittedAt: string;
}

export interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  assignedAthletes: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  responses?: QuestionnaireResponse[];
}

export interface QuestionnaireCreateData {
  title: string;
  description?: string;
  questions: Question[];
  assignedAthletes: string[];
  createdBy: string;
}

export interface QuestionnaireUpdateData {
  title?: string;
  description?: string;
  questions?: Question[];
  assignedAthletes?: string[];
}

// Sample data
const sampleQuestionnaires: Questionnaire[] = [
  {
    id: '1',
    title: 'Evaluación diaria',
    description: 'Este cuestionario se utiliza para evaluar el estado diario de los atletas',
    questions: [
      { id: '1', text: '¿Cómo calificarías tu nivel de energía hoy?', type: 'scale' },
      { id: '2', text: '¿Has sentido dolor muscular o articular?', type: 'long_text' },
      { id: '3', text: '¿Cuántas horas has dormido?', type: 'number' }
    ],
    assignedAthletes: ['1', '2'],
    createdBy: 'trainer-1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    title: 'Evaluación post-entrenamiento',
    description: 'Cuestionario para evaluar la respuesta al entrenamiento',
    questions: [
      { id: '1', text: '¿Cómo calificas la intensidad del entrenamiento?', type: 'scale' },
      { id: '2', text: '¿Has podido completar todas las series y repeticiones?', type: 'short_text' },
      { id: '3', text: '¿Qué ejercicio te ha resultado más difícil y por qué?', type: 'long_text' }
    ],
    assignedAthletes: ['1', '3'],
    createdBy: 'trainer-1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Load data from localStorage if available
const storedQuestionnaires = browser && localStorage.getItem('questionnaires');
const initialQuestionnaires = storedQuestionnaires 
  ? JSON.parse(storedQuestionnaires) 
  : sampleQuestionnaires;

// Create the store
const createQuestionnaireStore = () => {
  const { subscribe, set, update } = writable<Questionnaire[]>(initialQuestionnaires);

  return {
    subscribe,
    
    // Add a new questionnaire
    addQuestionnaire: (data: QuestionnaireCreateData) => {
      const now = new Date().toISOString();
      
      const newQuestionnaire: Questionnaire = {
        id: uuidv4(),
        ...data,
        createdAt: now,
        updatedAt: now
      };
      
      update(questionnaires => {
        const updatedQuestionnaires = [...questionnaires, newQuestionnaire];
        if (browser) {
          localStorage.setItem('questionnaires', JSON.stringify(updatedQuestionnaires));
        }
        return updatedQuestionnaires;
      });
      
      return newQuestionnaire.id;
    },
    
    // Update an existing questionnaire
    updateQuestionnaire: (id: string, data: QuestionnaireUpdateData) => {
      update(questionnaires => {
        const updatedQuestionnaires = questionnaires.map(q => {
          if (q.id === id) {
            return {
              ...q,
              ...data,
              updatedAt: new Date().toISOString()
            };
          }
          return q;
        });
        
        if (browser) {
          localStorage.setItem('questionnaires', JSON.stringify(updatedQuestionnaires));
        }
        
        return updatedQuestionnaires;
      });
    },
    
    // Remove a questionnaire
    removeQuestionnaire: (id: string) => {
      update(questionnaires => {
        const updatedQuestionnaires = questionnaires.filter(q => q.id !== id);
        
        if (browser) {
          localStorage.setItem('questionnaires', JSON.stringify(updatedQuestionnaires));
        }
        
        return updatedQuestionnaires;
      });
    },
    
    // Get a questionnaire by ID
    getQuestionnaire: (id: string) => {
      let result: Questionnaire | undefined;
      
      update(questionnaires => {
        result = questionnaires.find(q => q.id === id);
        return questionnaires;
      });
      
      return result;
    },
    
    // Get all questionnaires for an athlete
    getQuestionnairesByAthlete: (athleteId: string) => {
      let result: Questionnaire[] = [];
      
      update(questionnaires => {
        result = questionnaires.filter(q => q.assignedAthletes.includes(athleteId));
        return questionnaires;
      });
      
      return result;
    },
    
    // Add a response to a questionnaire
    addResponse: (questionnaireId: string, response: Omit<QuestionnaireResponse, 'id' | 'submittedAt'>) => {
      const responseId = uuidv4();
      const submittedAt = new Date().toISOString();
      
      update(questionnaires => {
        const updatedQuestionnaires = questionnaires.map(q => {
          if (q.id === questionnaireId) {
            const newResponse = {
              id: responseId,
              ...response,
              submittedAt
            };
            
            return {
              ...q,
              responses: q.responses ? [...q.responses, newResponse] : [newResponse],
              updatedAt: submittedAt
            };
          }
          return q;
        });
        
        if (browser) {
          localStorage.setItem('questionnaires', JSON.stringify(updatedQuestionnaires));
        }
        
        return updatedQuestionnaires;
      });
      
      return responseId;
    },
    
    // Reset to initial data (for testing)
    reset: () => {
      set(sampleQuestionnaires);
      if (browser) {
        localStorage.setItem('questionnaires', JSON.stringify(sampleQuestionnaires));
      }
    }
  };
};

export const questionnaires = createQuestionnaireStore(); 