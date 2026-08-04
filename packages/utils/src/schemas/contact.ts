import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email address"),
  subject: z.string().trim().min(1, "Subject is required").max(150),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
  company: z.string().max(0).optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const contactRequestSchema = contactFormSchema.extend({
  turnstileToken: z.string().min(1, "Verification required"),
});

export type ContactRequestValues = z.infer<typeof contactRequestSchema>;
