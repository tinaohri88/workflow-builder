/**
 * Store constants
 */

import type { WorkflowState } from '../types';

export const EMPTY_WORKFLOW_STATE: WorkflowState = {
  nodes: [],
  edges: [],
};

export const MAX_HISTORY_SIZE = 50;

export const STORAGE_KEYS = {
  WORKFLOW: 'workflow',
  VIEWPORT: 'viewport',
} as const;
