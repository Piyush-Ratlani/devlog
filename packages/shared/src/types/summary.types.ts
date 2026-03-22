export interface WeeklySummary {
  id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  topProjects: string[];
  topTags: string[];
  themes: string[];
  wins: string[];
  risks: string[];
  generatedText: string;
  createdAt: string;
  regeneratable: boolean;
}

export interface SummaryResponse {
  status: "success" | "error";
  message: string;
  data?: WeeklySummary;
}

export interface GenerateSummaryRequestBody {
  weekStart: string;
  weekEnd: string;
}
