/**
 * Workflow persistence actions
 */

import type { WorkflowState, ViewportState } from '../types';

export interface PersistenceActions {
  /**
   * Load a workflow from data
   * @param data The workflow state to load
   */
  loadWorkflow(data: WorkflowState): void;
  
  /**
   * Clear the entire workflow
   */
  clearWorkflow(): void;
  
  /**
   * Save viewport state (position and zoom)
   * @param viewport The viewport state to save
   */
  saveViewport(viewport: ViewportState): void;
}

export function createPersistenceActions(store: any): PersistenceActions {
  return {
    loadWorkflow(data: WorkflowState) {
      store.past = [];
      store.future = [];
      store.present = JSON.parse(JSON.stringify(data));
      store.selectedNodeId = null;
      localStorage.setItem("workflow", JSON.stringify(store.present));
    },

    clearWorkflow() {
      store.commit({ nodes: [], edges: [] }, "Clear Canvas");
      store.selectedNodeId = null;
      store.selectedStartNodeId = null;
    },

    saveViewport(viewport: ViewportState) {
      store.viewport = viewport;
      localStorage.setItem("viewport", JSON.stringify(viewport));
    },
  };
}
