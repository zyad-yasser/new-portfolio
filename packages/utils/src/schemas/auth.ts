import { z } from "zod";
import { passwordSchema } from "./password";

export const MAX_NAME_LENGTH = 100;

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(MAX_NAME_LENGTH, `Name must be at most ${MAX_NAME_LENGTH} characters`);

export const credentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type CredentialsValues = z.infer<typeof credentialsSchema>;

export const loginSchema = credentialsSchema.extend({
  rememberMe: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type SignupValues = z.infer<typeof signupSchema>;
