import { email, z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters")
      .trim(),
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be less than 100 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
    password: z
      .string({ error: "Password is required" })
      .min(1, "Password is required"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
