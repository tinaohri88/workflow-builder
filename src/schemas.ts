// schemas/index.ts
import { z } from 'zod'

export const schemas: Record<string, any> = {
  email: z.object({
    label: z.string().min(1, "Label is required"),
    recipient: z.string().email("Invalid email address"),
    subject: z.string().min(5, "Subject must be at least 5 chars"),
  }),
  http: z.object({
    label: z.string().min(1, "Label is required"),
    url: z.string().url("Must be a valid URL"),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  }),
  sms: z.object({
    label: z.string().min(1, "Label is required"),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone format"),
  }),
  condition: z.object({
    label: z.string().min(1, "Label is required"),
    variable: z.string().min(1, "Variable name required"),
    operator: z.enum(['==', '!=', '>', '<']),
    value: z.string().min(1, "Value required"),
  }),
}