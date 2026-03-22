export type Mood = "great" | "good" | "neutral" | "bad" | "terrible";

export interface CreateEntryRequestBody {
  date: string;
  hours: number;
  project: string;
  tags: string[];
  mood: Mood;
  notes?: string;
}

export interface Entry {
  id: string;
  date: string;
  hours: number;
  project: string;
  tags: string[];
  mood: Mood;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntryResponse {
  status: "success" | "error";
  message: string;
  data?: Entry;
}

export interface EntriesResponse {
  status: "success" | "error";
  message: string;
  data?: Entry[];
}
