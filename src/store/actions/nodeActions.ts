/**
 * Node manipulation actions
 */

import type { WorkflowNode } from '../types';

export interface NodeActions {
  /**
   * Duplicate an existing node
   * @param nodeId The ID of the node to duplicate
   */
  duplicateNode(nodeId: string): void;
  
  /**
   * Delete a node and its connected edges
   * @param nodeId The ID of the node to delete
   */
  deleteNode(nodeId: string): void;
}

export function createNodeActions(store: any): NodeActions {
  return {
    duplicateNode(nodeId: string) {
      const nodeToCopy = store.present.nodes.find((n: WorkflowNode) => n.id === nodeId);
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

      store.commit(
        {
          ...store.present,
          nodes: [...store.present.nodes, newNode],
        },
        `Duplicate ${nodeToCopy.type}`,
      );
    },

    deleteNode(nodeId: string) {
      const nodeToDelete = store.present.nodes.find((n: WorkflowNode) => n.id === nodeId);
      const filteredNodes = store.present.nodes.filter((n: WorkflowNode) => n.id !== nodeId);
      const filteredEdges = store.present.edges.filter(
        (e: any) => e.source !== nodeId && e.target !== nodeId,
      );

      store.commit(
        {
          nodes: filteredNodes,
          edges: filteredEdges,
        },
        `Delete ${nodeToDelete?.type || "Node"}`,
      );

      if (store.selectedNodeId === nodeId) {
        store.selectedNodeId = null;
      }

      // Clear selected start node if it was deleted
      if (store.selectedStartNodeId === nodeId) {
        store.selectedStartNodeId = null;
      }
    },
  };
}
