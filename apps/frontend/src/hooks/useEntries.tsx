import { useCallback, useEffect, useState } from "react";
import type { Entry } from "@devlog/shared";
import { api } from "../lib/axios";

interface UseEntriesReturn {
  entries: Entry[];
  isLoading: boolean;
  error: string | null;
  createEntry: (data: CreateEntryData) => Promise<void>;
  updateEntry: (id: string, data: UpdateEntryData) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export interface CreateEntryData {
  date: string;
  hours: number;
  project: string;
  tags: string[];
  mood: "great" | "good" | "neutral" | "bad" | "terrible";
  notes?: string;
}

export interface UpdateEntryData {
  date?: string;
  hours?: number;
  project?: string;
  tags?: string[];
  mood?: "great" | "good" | "neutral" | "bad" | "terrible";
  notes?: string;
}

export const useEntries = (): UseEntriesReturn => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get("/api/entries");
      setEntries(res.data.data);
    } catch {
      setError("Failed to fetch entries");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = useCallback(async (data: CreateEntryData) => {
    const res = await api.post("/api/entries", data);
    setEntries(prev => [res.data.data, ...prev]);
  }, []);

  const updateEntry = useCallback(async (id: string, data: UpdateEntryData) => {
    const res = await api.patch(`/api/entries/${id}`, data);
    setEntries(prev => prev.map(e => (e.id === id ? res.data.data : e)));
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    await api.delete(`/api/entries/${id}`);
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  return {
    entries,
    isLoading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
};
