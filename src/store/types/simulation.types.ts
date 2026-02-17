/**
 * Simulation and execution type definitions
 */

export type LogStatus = "success" | "error" | "skipped";

export interface LogEntry {
  timestamp: string;
  nodeId: string;
  status: LogStatus;
  message: string;
}

export interface SimulationState {
  isRunning: boolean;
  activeNodeId: string | null;
  logs: LogEntry[];
  selectedStartNodeId: string | null;
}
