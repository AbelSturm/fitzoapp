import { writable } from 'svelte/store';

// Define types
export interface Athlete {
  id: string;
  name: string;
  email: string;
  completedWorkouts: number;
  assignedWorkouts: string[]; // Array of workout IDs
  assignedQuestionnaires: string[]; // Array of questionnaire IDs
  createdAt: Date;
}

// Create some dummy data
const dummyAthletes: Athlete[] = [
  {
    id: '1',
    name: 'Ana García',
    email: 'ana.garcia@example.com',
    completedWorkouts: 12,
    assignedWorkouts: ['1'],
    assignedQuestionnaires: ['1'],
    createdAt: new Date('2023-03-15')
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@example.com',
    completedWorkouts: 8,
    assignedWorkouts: ['1'],
    assignedQuestionnaires: ['2'],
    createdAt: new Date('2023-04-10')
  },
  {
    id: '3',
    name: 'Elena Martínez',
    email: 'elena.martinez@example.com',
    completedWorkouts: 15,
    assignedWorkouts: ['2'],
    assignedQuestionnaires: ['1'],
    createdAt: new Date('2023-02-20')
  }
];

// Create the store
function createAthleteStore() {
  const { subscribe, set, update } = writable<Athlete[]>(dummyAthletes);
  
  return {
    subscribe,
    addAthlete: (athlete: Omit<Athlete, 'id' | 'createdAt' | 'completedWorkouts' | 'assignedWorkouts' | 'assignedQuestionnaires'>) => {
      update(athletes => {
        const newAthlete = {
          ...athlete,
          id: (Math.max(...athletes.map(a => parseInt(a.id))) + 1).toString(),
          createdAt: new Date(),
          completedWorkouts: 0,
          assignedWorkouts: [],
          assignedQuestionnaires: []
        };
        return [...athletes, newAthlete];
      });
    },
    updateAthlete: (id: string, athlete: Partial<Athlete>) => {
      update(athletes => 
        athletes.map(a => a.id === id ? { ...a, ...athlete } : a)
      );
    },
    deleteAthlete: (id: string) => {
      update(athletes => athletes.filter(a => a.id !== id));
    },
    assignWorkout: (athleteId: string, workoutId: string) => {
      update(athletes => 
        athletes.map(a => {
          if (a.id === athleteId && !a.assignedWorkouts.includes(workoutId)) {
            return { ...a, assignedWorkouts: [...a.assignedWorkouts, workoutId] };
          }
          return a;
        })
      );
    },
    assignQuestionnaire: (athleteId: string, questionnaireId: string) => {
      update(athletes => 
        athletes.map(a => {
          if (a.id === athleteId && !a.assignedQuestionnaires.includes(questionnaireId)) {
            return { ...a, assignedQuestionnaires: [...a.assignedQuestionnaires, questionnaireId] };
          }
          return a;
        })
      );
    },
    completeWorkout: (athleteId: string, workoutId: string) => {
      update(athletes => 
        athletes.map(a => {
          if (a.id === athleteId) {
            return { 
              ...a, 
              completedWorkouts: a.completedWorkouts + 1,
              assignedWorkouts: a.assignedWorkouts.filter(id => id !== workoutId)
            };
          }
          return a;
        })
      );
    }
  };
}

export const athletes = createAthleteStore(); 