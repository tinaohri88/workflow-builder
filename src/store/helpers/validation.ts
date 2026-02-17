/**
 * Workflow validation helpers
 */

import type { WorkflowNode, WorkflowEdge } from '../types';

/**
 * Get all start nodes (trigger nodes with NO incoming edges)
 */
export function getStartNodes(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const triggerNodes = nodes.filter(
    (n) => n.type === "manual" || n.type === "webhook",
  );
  return triggerNodes.filter(
    (trigger) => !edges.some((edge) => edge.target === trigger.id),
  );
}

/**
 * Get validation warnings for the workflow
 */
export function getValidationWarnings(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const warnings: string[] = [];
  const startNodesList = getStartNodes(nodes, edges);

  if (startNodesList.length > 1) {
    warnings.push(
      `⚠️ Multiple start nodes detected (${startNodesList.length}). Only one will execute.`,
    );
  }

  if (startNodesList.length === 0 && nodes.length > 0) {
    warnings.push(
      "⚠️ No valid start node found. Create a trigger node (manual/webhook) with no incoming edges.",
    );
  }

  return warnings;
}
