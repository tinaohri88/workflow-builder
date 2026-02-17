/**
 * Edge manipulation actions
 */

import type { WorkflowEdge } from '../types';

export interface EdgeActions {
  /**
   * Delete an edge from the workflow
   * @param edgeId The ID of the edge to delete
   */
  deleteEdge(edgeId: string): void;
}

export function createEdgeActions(store: any): EdgeActions {
  return {
    deleteEdge(edgeId: string) {
      const filteredEdges = store.present.edges.filter((e: WorkflowEdge) => e.id !== edgeId);
      store.commit(
        {
          ...store.present,
          edges: filteredEdges,
        },
        "Delete Edge",
      );
    },
  };
}
