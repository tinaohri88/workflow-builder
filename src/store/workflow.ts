/**
 * Main Workflow Store
 * 
 * This is the central state management for the workflow builder.
 * Responsibilities are modularized into separate action modules.
 */

import { defineStore } from "pinia";
import type { HistoryStep, LogEntry, ViewportState, WorkflowState } from "./types";
import { getStartNodes, getValidationWarnings } from "./helpers/validation";
import { EMPTY_WORKFLOW_STATE, MAX_HISTORY_SIZE, STORAGE_KEYS } from "./constants";

// Re-export types for backward compatibility
export type { WorkflowState, HistoryStep, LogEntry };

export const useWorkflowStore = defineStore("workflow", {
  state: () => ({
    present: JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKFLOW) || "null") || EMPTY_WORKFLOW_STATE,
    past: [] as HistoryStep[],
    future: [] as HistoryStep[],
    selectedNodeId: null as string | null,
    // Simulation State
    isRunning: false,
    activeNodeId: null as string | null,
    logs: [] as LogEntry[],
    selectedStartNodeId: null as string | null,
    // Viewport State
    viewport: JSON.parse(localStorage.getItem(STORAGE_KEYS.VIEWPORT) || "null") as ViewportState | null,
    // Performance: Track pending node drag to batch updates
    pendingNodeDrag: false as boolean,
    // Performance: Max history size to prevent memory leaks
    maxHistorySize: MAX_HISTORY_SIZE,
  }),

  getters: {
    /**
     * Get all start nodes (trigger nodes with NO incoming edges)
     */
    startNodes(state) {
      return getStartNodes(state.present.nodes, state.present.edges);
    },

    /**
     * Get validation warnings for the workflow
     */
    validationWarnings(state): string[] {
      return getValidationWarnings(state.present.nodes, state.present.edges);
    },
  },

  actions: {
    // --- HISTORY ACTIONS ---
    commit(state: WorkflowState, label: string = "Manual Change") {
      this.past.push({
        state: JSON.parse(JSON.stringify(this.present)),
        label,
        timestamp: new Date().toLocaleTimeString(),
      });
      
      if (this.past.length > this.maxHistorySize) {
        this.past = this.past.slice(-this.maxHistorySize);
      }
      
      this.future = [];
      this.present = JSON.parse(JSON.stringify(state));
      localStorage.setItem(STORAGE_KEYS.WORKFLOW, JSON.stringify(this.present));
    },

    undo() {
      if (!this.past.length) return;
      const previous = this.past.pop()!;

      this.future.unshift({
        state: JSON.parse(JSON.stringify(this.present)),
        label: previous.label,
        timestamp: new Date().toLocaleTimeString(),
      });

      this.present = previous.state;
      localStorage.setItem(STORAGE_KEYS.WORKFLOW, JSON.stringify(this.present));
      this.addLog("system", "success", `Undo: ${previous.label}`);
    },

    redo() {
      if (!this.future.length) return;
      const next = this.future.shift()!;

      this.past.push({
        state: JSON.parse(JSON.stringify(this.present)),
        label: next.label,
        timestamp: new Date().toLocaleTimeString(),
      });

      this.present = next.state;
      localStorage.setItem(STORAGE_KEYS.WORKFLOW, JSON.stringify(this.present));
      this.addLog("system", "success", `Redo: ${next.label}`);
    },

    jumpToHistory(index: number) {
      const target = this.past[index];
      if (!target) return;

      this.present = JSON.parse(JSON.stringify(target.state));
      this.past = this.past.slice(0, index);
      this.future = [];
      localStorage.setItem(STORAGE_KEYS.WORKFLOW, JSON.stringify(this.present));
      this.addLog("system", "success", `Jumped to: ${target.label}`);
    },

    // --- NODE ACTIONS ---
    duplicateNode(nodeId: string) {
      const nodeToCopy = this.present.nodes.find((n: any) => n.id === nodeId);
      if (!nodeToCopy) return;

      const newNode = {
        ...JSON.parse(JSON.stringify(nodeToCopy)),
        id: crypto.randomUUID(),
        selected: false,
        position: {
          x: nodeToCopy.position.x + 40,
          y: nodeToCopy.position.y + 40,
        },
      };

      this.commit(
        {
          ...this.present,
          nodes: [...this.present.nodes, newNode],
        },
        `Duplicate ${nodeToCopy.type}`,
      );
    },

    deleteNode(nodeId: string) {
      const nodeToDelete = this.present.nodes.find((n: any) => n.id === nodeId);
      const filteredNodes = this.present.nodes.filter((n: any) => n.id !== nodeId);
      const filteredEdges = this.present.edges.filter(
        (e: any) => e.source !== nodeId && e.target !== nodeId,
      );

      this.commit(
        {
          nodes: filteredNodes,
          edges: filteredEdges,
        },
        `Delete ${nodeToDelete?.type || "Node"}`,
      );

      if (this.selectedNodeId === nodeId) {
        this.selectedNodeId = null;
      }

      if (this.selectedStartNodeId === nodeId) {
        this.selectedStartNodeId = null;
      }
    },

    // --- EDGE ACTIONS ---
    deleteEdge(edgeId: string) {
      const filteredEdges = this.present.edges.filter((e: any) => e.id !== edgeId);
      this.commit(
        {
          ...this.present,
          edges: filteredEdges,
        },
        "Delete Edge",
      );
    },

    // --- PERSISTENCE ACTIONS ---
    loadWorkflow(data: WorkflowState) {
      this.past = [];
      this.future = [];
      this.present = JSON.parse(JSON.stringify(data));
      this.selectedNodeId = null;
      localStorage.setItem(STORAGE_KEYS.WORKFLOW, JSON.stringify(this.present));
    },

    clearWorkflow() {
      this.commit({ nodes: [], edges: [] }, "Clear Canvas");
      this.selectedNodeId = null;
      this.selectedStartNodeId = null;
    },

    saveViewport(viewport: ViewportState) {
      this.viewport = viewport;
      localStorage.setItem(STORAGE_KEYS.VIEWPORT, JSON.stringify(viewport));
    },

    // --- SIMULATION ACTIONS ---
    addLog(nodeId: string, status: "success" | "error" | "skipped", message: string) {
      this.logs.unshift({
        timestamp: new Date().toLocaleTimeString(),
        nodeId,
        status,
        message,
      });
    },

    setSelectedStartNode(nodeId: string | null) {
      this.selectedStartNodeId = nodeId;
    },

    async runSimulation() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.logs = [];

      const startNodes = this.startNodes;
      let currentNode: any;
      
      if (this.selectedStartNodeId) {
        currentNode = this.present.nodes.find(
          (n: any) => n.id === this.selectedStartNodeId,
        );
        if (!currentNode && startNodes.length > 0) {
          this.selectedStartNodeId = null;
          currentNode = startNodes[0];
        }
      } else if (startNodes.length > 0) {
        currentNode = startNodes[0];
        if (startNodes.length > 1) {
          this.addLog(
            "system",
            "error",
            `Multiple start nodes detected. Executing: "${currentNode.data?.label || currentNode.type}". Other start nodes will be ignored.`,
          );
        }
      }

      if (!currentNode) {
        this.addLog(
          "system",
          "error",
          "No valid start node found. Create a manual or webhook trigger node without incoming edges.",
        );
        this.isRunning = false;
        return;
      }

      while (currentNode && this.isRunning) {
        this.activeNodeId = currentNode.id;
        const nodeLabel = currentNode.data?.label || currentNode.type;
        this.addLog(currentNode.id, "success", `Executing ${nodeLabel}...`);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const outgoingEdges = this.present.edges.filter(
          (e: any) => e.source === currentNode.id,
        );

        if (outgoingEdges.length === 0) {
          this.addLog(currentNode.id, "success", "Workflow Finished.");
          break;
        }

        let nextEdge: any;

        if (currentNode.type === "condition") {
          const conditionPassed = Math.random() > 0.3;
          const branchToFollow = conditionPassed ? "true" : "false";

          this.addLog(
            currentNode.id,
            "success",
            `Condition evaluated to: ${branchToFollow.toUpperCase()}`,
          );

          nextEdge = outgoingEdges.find(
            (e: any) => e.sourceHandle === branchToFollow,
          );

          outgoingEdges.forEach((e: any) => {
            if (!nextEdge || e.id !== nextEdge.id) {
              this.addLog(
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
          this.addLog(currentNode.id, "error", "No valid path found.");
          break;
        }

        currentNode = this.present.nodes.find((n: any) => n.id === nextEdge.target);
      }

      this.activeNodeId = null;
      this.isRunning = false;
    },
  },
});





