export type Mood = 1 | 2 | 3 | 4 | 5;

export interface CheckIn {
  id: string;
  date: string;
  mood: Mood;
  painLevel: number;
  sleepHours: number;
  sleepQuality: number;
  dietNotes: string;
  symptoms: string[];
  generalNotes: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  logs?: MedLog[];
}

export interface MedLog {
  id: string;
  medId: string;
  date: string;
  taken: boolean;
}
