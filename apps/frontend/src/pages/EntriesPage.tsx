import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useEntries,
  type CreateEntryData,
  type UpdateEntryData,
} from "../hooks/useEntries";

const MOODS = [
  { value: "great", label: "🚀 Great", color: "text-mood-great" },
  { value: "good", label: "😊 Good", color: "text-mood-good" },
  { value: "neutral", label: "😐 Neutral", color: "text-mood-neutral" },
  { value: "bad", label: "😕 Bad", color: "text-mood-bad" },
  { value: "terrible", label: "😞 Terrible", color: "text-mood-terrible" },
] as const;

const entrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  hours: z
    .number({ error: "Hours must be a number" })
    .min(0.5, "Minimum 0.5 hours")
    .max(24, "Maximum 24 hours"),
  project: z.string().min(1, "Project is required").max(100),
  tags: z.string().min(1, "At least one tag is required"),
  mood: z.enum(["great", "good", "neutral", "bad", "terrible"]),
  notes: z.string().max(500).optional(),
});

type EntryFormData = z.infer<typeof entrySchema>;

const EntryForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  defaultValues: Partial<EntryFormData>;
  onSubmit: (data: EntryFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: EntryFormData) => {
    try {
      setServerError(null);
      await onSubmit(data);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {serverError && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm">{serverError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Date</label>
          <input type="date" className="input-field" {...register("date")} />
          {errors.date && <p className="error-text">{errors.date.message}</p>}
        </div>

        <div>
          <label className="label">Hours</label>
          <input
            type="number"
            step="0.5"
            placeholder="6"
            className="input-field"
            {...register("hours", { valueAsNumber: true })}
          />
          {errors.hours && <p className="error-text">{errors.hours.message}</p>}
        </div>

        <div>
          <label className="label">Project</label>
          <input
            type="text"
            placeholder="DevLog"
            className="input-field"
            {...register("project")}
          />
          {errors.project && (
            <p className="error-text">{errors.project.message}</p>
          )}
        </div>

        <div>
          <label className="label">Mood</label>
          <select className="input-field" {...register("mood")}>
            {MOODS.map(mood => (
              <option key={mood.value} value={mood.value}>
                {mood.label}
              </option>
            ))}
          </select>
          {errors.mood && <p className="error-text">{errors.mood.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">
          Tags{" "}
          <span className="text-gray-500 font-normal">(comma separated)</span>
        </label>
        <input
          type="text"
          placeholder="typescript, nestjs, backend"
          className="input-field"
          {...register("tags")}
        />
        {errors.tags && <p className="error-text">{errors.tags.message}</p>}
      </div>

      <div>
        <label className="label">
          Notes <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="What did you work on today?"
          className="input-field resize-none"
          {...register("notes")}
        />
        {errors.notes && <p className="error-text">{errors.notes.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
};

const EntriesPage = () => {
  const { entries, isLoading, error, createEntry, updateEntry, deleteEntry } =
    useEntries();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getMoodConfig = (mood: string) =>
    MOODS.find(m => m.value === mood) ?? MOODS[2];

  const handleCreate = async (data: EntryFormData) => {
    const payload: CreateEntryData = {
      ...data,
      tags: data.tags
        .split(",")
        .map(t => t.trim())
        .filter(Boolean),
      hours: Number(data.hours),
    };
    await createEntry(payload);
    setIsFormOpen(false);
  };

  const handleUpdate = async (id: string, data: EntryFormData) => {
    const payload: UpdateEntryData = {
      ...data,
      tags: data.tags
        .split(",")
        .map(t => t.trim())
        .filter(Boolean),
      hours: Number(data.hours),
    };
    await updateEntry(id, payload);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteEntry(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-100">Entries</h1>
          <p className="text-gray-400 text-sm mt-1">
            Track your daily development work
          </p>
        </div>
        <button
          onClick={() => {
            setIsFormOpen(prev => !prev);
            setEditingId(null);
          }}
          className="btn-primary"
        >
          {isFormOpen ? "Cancel" : "+ New Entry"}
        </button>
      </div>

      {/* Create Form */}
      {isFormOpen && (
        <div className="card">
          <h3 className="text-gray-100 mb-4">Log Today's Work</h3>
          <EntryForm
            defaultValues={{
              date: new Date().toISOString().split("T")[0],
              mood: "good",
            }}
            onSubmit={handleCreate}
            onCancel={() => setIsFormOpen(false)}
            submitLabel="Save Entry"
          />
        </div>
      )}

      {/* Entries List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <p className="text-red-400">{error}</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg">No entries yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Log your first entry to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => {
            const moodConfig = getMoodConfig(entry.mood);
            const isExpanded = expandedId === entry.id;
            const isEditing = editingId === entry.id;

            return (
              <div key={entry.id} className="card space-y-3">
                {isEditing ? (
                  <>
                    <h3 className="text-gray-100">Edit Entry</h3>
                    <EntryForm
                      defaultValues={{
                        date: new Date(entry.date).toISOString().split("T")[0],
                        hours: entry.hours,
                        project: entry.project,
                        tags:
                          entry.tags?.map((t: any) => t.name).join(", ") ?? "",
                        mood: entry.mood as any,
                        notes: entry.notes ?? "",
                      }}
                      onSubmit={data => handleUpdate(entry.id, data)}
                      onCancel={() => setEditingId(null)}
                      submitLabel="Update Entry"
                    />
                  </>
                ) : (
                  <>
                    {/* Entry Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-gray-100 font-medium">
                            {entry.project}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {new Date(entry.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {entry.hours}h
                          </span>
                          <span className={`text-sm ${moodConfig.color}`}>
                            {moodConfig.label}
                          </span>
                        </div>

                        {/* Notes */}
                        {entry.notes && (
                          <p
                            className={`text-gray-400 text-sm mt-1 cursor-pointer hover:text-gray-300 transition-colors ${
                              isExpanded ? "" : "truncate"
                            }`}
                            onClick={() =>
                              setExpandedId(isExpanded ? null : entry.id)
                            }
                          >
                            {entry.notes}
                            {!isExpanded && entry.notes.length > 60 && (
                              <span className="text-brand-500 ml-1 text-xs">
                                show more
                              </span>
                            )}
                          </p>
                        )}

                        {/* Tags */}
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {entry.tags.map((tag: any) => (
                              <span
                                key={tag.id}
                                className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-400 text-xs"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(entry.id);
                            setExpandedId(null);
                          }}
                          className="text-gray-600 hover:text-brand-400 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                          className="text-gray-600 hover:text-red-400 transition-colors text-sm disabled:opacity-50"
                        >
                          {deletingId === entry.id ? "..." : "✕"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EntriesPage;
