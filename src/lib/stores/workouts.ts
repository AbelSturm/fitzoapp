import { writable } from 'svelte/store';

// Define types
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: number; // in seconds
  notes?: string;
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
  assignedAthletes: string[]; // Array of athlete IDs
  createdAt: Date;
  createdBy: string; // trainer ID
}

// Create some dummy data
const dummyWorkouts: Workout[] = [
  {
    id: '1',
    title: 'Entrenamiento de fuerza básico',
    description: 'Un entrenamiento para desarrollar fuerza general enfocado en las piernas y el core.',
    exercises: [
      {
        id: '1',
        name: 'Sentadillas',
        sets: 3,
        reps: 12,
        rest: 60,
        notes: 'Mantén la espalda recta'
      },
      {
        id: '2',
        name: 'Peso muerto',
        sets: 3,
        reps: 10,
        rest: 90,
        notes: 'Mantén las rodillas ligeramente flexionadas'
      },
      {
        id: '3',
        name: 'Plancha',
        sets: 3,
        reps: 60, // seconds
        rest: 45,
        notes: 'Mantén el cuerpo en línea recta'
      }
    ],
    assignedAthletes: ['1', '2'],
    createdAt: new Date('2023-06-15'),
    createdBy: 'trainer-1'
  },
  {
    id: '2',
    title: 'Entrenamiento de resistencia',
    description: 'Entrenamiento para mejorar la resistencia cardiovascular.',
    exercises: [
      {
        id: '4',
        name: 'Carrera continua',
        sets: 1,
        reps: 1, // 20 minutes
        rest: 0,
        notes: 'Mantén un ritmo constante durante 20 minutos'
      },
      {
        id: '5',
        name: 'Saltos de cuerda',
        sets: 4,
        reps: 50,
        rest: 30,
        notes: 'Mantén un ritmo constante'
      },
      {
        id: '6',
        name: 'Burpees',
        sets: 3,
        reps: 15,
        rest: 60,
        notes: 'Realiza el movimiento completo'
      }
    ],
    assignedAthletes: ['3'],
    createdAt: new Date('2023-07-01'),
    createdBy: 'trainer-1'
  }
];

// Create the store
function createWorkoutStore() {
  const { subscribe, set, update } = writable<Workout[]>(dummyWorkouts);
  
  return {
    subscribe,
    addWorkout: (workout: Omit<Workout, 'id' | 'createdAt'>) => {
      update(workouts => {
        const newWorkout = {
          ...workout,
          id: (Math.max(...workouts.map(w => parseInt(w.id))) + 1).toString(),
          createdAt: new Date()
        };
        return [...workouts, newWorkout];
      });
    },
    updateWorkout: (id: string, workout: Partial<Workout>) => {
      update(workouts => 
        workouts.map(w => w.id === id ? { ...w, ...workout } : w)
      );
    },
    deleteWorkout: (id: string) => {
      update(workouts => workouts.filter(w => w.id !== id));
    },
    assignAthlete: (workoutId: string, athleteId: string) => {
      update(workouts => 
        workouts.map(w => {
          if (w.id === workoutId && !w.assignedAthletes.includes(athleteId)) {
            return { ...w, assignedAthletes: [...w.assignedAthletes, athleteId] };
          }
          return w;
        })
      );
    },
    removeAthlete: (workoutId: string, athleteId: string) => {
      update(workouts => 
        workouts.map(w => {
          if (w.id === workoutId) {
            return { ...w, assignedAthletes: w.assignedAthletes.filter(id => id !== athleteId) };
          }
          return w;
        })
      );
    }
  };
}

export const workouts = createWorkoutStore(); 