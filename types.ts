
export interface Participant {
  id: string;
  name: string;
}

export type Theme = 'light' | 'dark';

export interface AppState {
  participants: Participant[];
  transcript: string;
  columns: number;
}
