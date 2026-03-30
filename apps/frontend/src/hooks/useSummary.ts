import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/axios";

interface Summary {
  id: string;
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

interface UseSummaryReturn {
  summary: Summary | null;
  isLoading: boolean;
  error: string | null;
  isGenerating: boolean;
  generate: (weekStart: string, weekEnd: string) => Promise<void>;
}

export const useSummary = (): UseSummaryReturn => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchLatest = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get("/api/summary/latest");
      setSummary(res.data.data);
    } catch {
      setError("Failed to load summary");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  const generate = useCallback(async (weekStart: string, weekEnd: string) => {
    setIsGenerating(true);
    try {
      const res = await api.post("/api/summary/generate", {
        weekStart,
        weekEnd,
      });
      setSummary(res.data.data);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { summary, isLoading, error, isGenerating, generate };
};
