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

export interface BehaviorLog {
  id: string;
  userId: string;
  timestamp: string;
  eventType: string;
  description?: string;
  perceivedTriggers: string[];
  intensity: number;
  durationMinutes?: number;
  copingStrategies: string[];
  notes?: string;
  efficacy?: number;
  environmentReaction?: string;
  location?: string;
  peoplePresent?: string;
  postCrisisState?: string;
  vulnerabilityFactors: string[];
  warningSigns?: string;
  executiveFunctionImpact: string[];
  neurotypicalTranslation?: string;
  preCrisisArousal?: number;
  sensorOverloadTypes: string[];
}
