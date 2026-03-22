// Re-export from shared package
// Backend-specific entry types extend the shared ones here if needed
export type {
  Mood,
  Entry,
  CreateEntryRequestBody,
  EntryResponse,
  EntriesResponse,
  EntryFilters,
} from "@devlog/shared";
