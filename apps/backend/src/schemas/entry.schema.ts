import { z } from "zod";

const MoodEnum = z.enum(["great", "good", "neutral", "bad", "terrible"], {
  error: () => ({
    message: "Mood must be one of: great, good, neutral, bad, terrible",
  }),
});

export const createEntrySchema = z.object({
  body: z.object({
    date: z
      .string({ error: "Date is required." })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    hours: z
      .number({ error: "Hour is required" })
      .min(0.5, "Hours must be atleast 0.5")
      .max(24, "Hours cannot exceed 24"),
    project: z
      .string({ error: "Project is required" })
      .min(1, "Project name is required")
      .max(100, "Project name must be less than 100 characters")
      .trim(),
    tags: z
      .array(z.string().min(1).max(30).trim())
      .min(1, "At least one tag is required")
      .max(10, "Maximum 10 tags allowed"),
    mood: MoodEnum,
    notes: z
      .string()
      .max(500, "Notes must be less than 500 characters")
      .trim()
      .optional(),
  }),
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
