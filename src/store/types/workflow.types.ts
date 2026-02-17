/**
 * Core workflow type definitions
 */

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data?: Record<string, any>;
  selected?: boolean;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  label?: string;
  animated?: boolean;
  updatable?: boolean;
  labelStyle?: Record<string, any>;
  labelBgStyle?: Record<string, any>;
}

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface HistoryStep {
  state: WorkflowState;
  label: string;
  timestamp: string;
}

export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}
