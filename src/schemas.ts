/**
 * Validation schemas for workflow nodes
 * 
 * This file defines Zod validation schemas for different node types.
 * Each schema validates the data structure and constraints for a specific node type.
 */

import { z } from 'zod';

/**
 * Email node schema
 */
export const emailSchema = z.object({
  label: z.string().min(1, "Label is required"),
  recipient: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 chars"),
});

/**
 * HTTP request node schema
 */
export const httpSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().url("Must be a valid URL"),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
});

/**
 * SMS node schema
 */
export const smsSchema = z.object({
  label: z.string().min(1, "Label is required"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone format"),
});

/**
 * Condition node schema
 */
export const conditionSchema = z.object({
  label: z.string().min(1, "Label is required"),
  variable: z.string().min(1, "Variable name required"),
  operator: z.enum(['==', '!=', '>', '<']),
  value: z.string().min(1, "Value required"),
});

/**
 * Schema registry mapping node types to their validation schemas
 */
export const schemas: Record<string, z.ZodObject<any>> = {
  email: emailSchema,
  http: httpSchema,
  sms: smsSchema,
  condition: conditionSchema,
};

/**
 * Type exports for use in components
 */
export type EmailNodeData = z.infer<typeof emailSchema>;
export type HttpNodeData = z.infer<typeof httpSchema>;
export type SmsNodeData = z.infer<typeof smsSchema>;
export type ConditionNodeData = z.infer<typeof conditionSchema>;