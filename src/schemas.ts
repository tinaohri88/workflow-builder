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
 * Transform node schema
 */
export const transformSchema = z.object({
  label: z.string().min(1, "Label is required"),
  expression: z.string().min(1, "Expression required"),
});

/**
 * Manual trigger node schema
 */
export const manualTriggerSchema = z.object({
  label: z.string().min(1, "Label is required"),
});

/**
 * Webhook trigger node schema
 */
export const webhookSchema = z.object({
  label: z.string().min(1, "Label is required"),
  path: z.string().min(1, "Webhook path required"),
});

/**
 * Node type metadata definition
 */
export interface NodeTypeConfig {
  type: string;
  label: string;
  category: 'trigger' | 'action' | 'logic';
  color: string;
  schema: z.ZodObject<any>;
  description?: string;
}

/**
 * Node types registry - define all available node types here
 * To add a new node type:
 * 1. Create a Zod schema above
 * 2. Add an entry to this array with metadata
 */
export const NODE_TYPES: NodeTypeConfig[] = [
  // Trigger nodes
  {
    type: 'manual',
    label: 'Manual Trigger',
    category: 'trigger',
    color: 'bg-green-500',
    schema: manualTriggerSchema,
    description: 'Manually trigger the workflow',
  },
  {
    type: 'webhook',
    label: 'Webhook',
    category: 'trigger',
    color: 'bg-green-600',
    schema: webhookSchema,
    description: 'Trigger workflow via webhook',
  },
  // Action nodes
  {
    type: 'http',
    label: 'HTTP Request',
    category: 'action',
    color: 'bg-blue-500',
    schema: httpSchema,
    description: 'Make an HTTP request',
  },
  {
    type: 'email',
    label: 'Email',
    category: 'action',
    color: 'bg-blue-400',
    schema: emailSchema,
    description: 'Send an email',
  },
  {
    type: 'sms',
    label: 'SMS',
    category: 'action',
    color: 'bg-indigo-400',
    schema: smsSchema,
    description: 'Send an SMS message',
  },
  // Logic nodes
  {
    type: 'condition',
    label: 'Condition',
    category: 'logic',
    color: 'bg-orange-500',
    schema: conditionSchema,
    description: 'Conditional branching logic',
  },
  {
    type: 'transform',
    label: 'Transform',
    category: 'logic',
    color: 'bg-orange-600',
    schema: transformSchema,
    description: 'Transform data',
  },
];

/**
 * Schema registry mapping node types to their validation schemas
 * Auto-generated from NODE_TYPES
 */
export const schemas: Record<string, z.ZodObject<any>> = NODE_TYPES.reduce(
  (acc, config) => {
    acc[config.type] = config.schema;
    return acc;
  },
  {} as Record<string, z.ZodObject<any>>
);

/**
 * Type exports for use in components
 */
export type EmailNodeData = z.infer<typeof emailSchema>;
export type HttpNodeData = z.infer<typeof httpSchema>;
export type SmsNodeData = z.infer<typeof smsSchema>;
export type ConditionNodeData = z.infer<typeof conditionSchema>;
export type TransformNodeData = z.infer<typeof transformSchema>;
export type ManualTriggerNodeData = z.infer<typeof manualTriggerSchema>;
export type WebhookNodeData = z.infer<typeof webhookSchema>;