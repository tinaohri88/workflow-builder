/**
 * Simulation execution actions
 */

import type { LogStatus, WorkflowNode, WorkflowEdge } from '../types';

export interface SimulationActions {
  /**
   * Add a log entry to the simulation logs
   * @param nodeId The ID of the node that generated the log
   * @param status The status of the log entry
   * @param message The log message
   */
  addLog(nodeId: string, status: LogStatus, message: string): void;
  
  /**
   * Set the selected start node for simulation
   * @param nodeId The ID of the start node, or null to clear
   */
  setSelectedStartNode(nodeId: string | null): void;
  
  /**
   * Run the workflow simulation
   */
  runSimulation(): Promise<void>;
}

export function createSimulationActions(store: any): SimulationActions {
  return {
    addLog(nodeId: string, status: LogStatus, message: string) {
      store.logs.unshift({
        timestamp: new Date().toLocaleTimeString(),
        nodeId,
        status,
        message,
      });
    },

    setSelectedStartNode(nodeId: string | null) {
      store.selectedStartNodeId = nodeId;
    },

    async runSimulation() {
      if (store.isRunning) return;
      store.isRunning = true;
      store.logs = [];

      // Get all start nodes
      const startNodes = store.startNodes;
      
      // Determine which start node to execute
      let currentNode: WorkflowNode | undefined;
      
      // If user explicitly selected a start node, try to use it
      if (store.selectedStartNodeId) {
        currentNode = store.present.nodes.find(
          (n: WorkflowNode) => n.id === store.selectedStartNodeId,
        );
        // If selected node doesn't exist (was deleted), clear selection and use first available
        if (!currentNode && startNodes.length > 0) {
          store.selectedStartNodeId = null;
          currentNode = startNodes[0];
        }
      } else if (startNodes.length > 0) {
        // If multiple start nodes exist, use the first one and warn
        currentNode = startNodes[0];
        if (startNodes.length > 1 && currentNode) {
          store.addLog(
            "system",
            "error",
            `Multiple start nodes detected. Executing: "${currentNode.data?.label || currentNode.type}". Other start nodes will be ignored.`,
          );
        }
      }

      if (!currentNode) {
        store.addLog(
          "system",
          "error",
          "No valid start node found. Create a manual or webhook trigger node without incoming edges.",
        );
        store.isRunning = false;
        return;
      }

      while (currentNode && store.isRunning) {
        store.activeNodeId = currentNode.id;
        const nodeLabel = currentNode.data?.label || currentNode.type;
        store.addLog(currentNode.id, "success", `Executing ${nodeLabel}...`);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const outgoingEdges = store.present.edges.filter(
          (e: WorkflowEdge) => e.source === currentNode!.id,
        );

        if (outgoingEdges.length === 0) {
          store.addLog(currentNode.id, "success", "Workflow Finished.");
          break;
        }

        let nextEdge: WorkflowEdge | undefined;

        if (currentNode.type === "condition") {
          const conditionPassed = Math.random() > 0.3;
          const branchToFollow = conditionPassed ? "true" : "false";

          store.addLog(
            currentNode.id,
            "success",
            `Condition evaluated to: ${branchToFollow.toUpperCase()}`,
          );

          nextEdge = outgoingEdges.find(
            (e: any) => e.sourceHandle === branchToFollow,
          );

          outgoingEdges.forEach((e: WorkflowEdge) => {
            if (!nextEdge || e.id !== nextEdge.id) {
              store.addLog(
                e.target,
                "skipped",
                `Branch ${e.label || ""} skipped.`,
              );
            }
          });
        } else {
          nextEdge = outgoingEdges[0];
        }

        if (!nextEdge) {
          store.addLog(currentNode.id, "error", "No valid path found.");
          break;
        }

        currentNode = store.present.nodes.find((n: WorkflowNode) => n.id === nextEdge!.target);
      }

      store.activeNodeId = null;
      store.isRunning = false;
    },
  };
}
