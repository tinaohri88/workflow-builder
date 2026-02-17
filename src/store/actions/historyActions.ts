/**
 * History management actions (undo, redo, jump)
 */

import type { WorkflowState, HistoryStep } from '../types';

export interface HistoryActions {
  /**
   * Commit a new state to history
   * @param state The new state to commit
   * @param label Descriptive text for the History Panel
   */
  commit(state: WorkflowState, label?: string): void;
  
  /**
   * Undo the last change
   */
  undo(): void;
  
  /**
   * Redo the last undone change
   */
  redo(): void;
  
  /**
   * Jump to a specific point in history
   * @param index The index in the past array to jump to
   */
  jumpToHistory(index: number): void;
}

export function createHistoryActions(store: any): HistoryActions {
  return {
    commit(state: WorkflowState, label: string = "Manual Change") {
      // Save current state to past before updating
      store.past.push({
        state: JSON.parse(JSON.stringify(store.present)),
        label,
        timestamp: new Date().toLocaleTimeString(),
      });
      
      // Limit history size to prevent memory leaks
      if (store.past.length > store.maxHistorySize) {
        store.past = store.past.slice(-store.maxHistorySize);
      }
      
      store.future = [];
      store.present = JSON.parse(JSON.stringify(state));
      localStorage.setItem("workflow", JSON.stringify(store.present));
    },

    undo() {
      if (!store.past.length) return;
      const previous = store.past.pop()!;

      // Move current state to future
      store.future.unshift({
        state: JSON.parse(JSON.stringify(store.present)),
        label: previous.label,
        timestamp: new Date().toLocaleTimeString(),
      });

      store.present = previous.state;
      localStorage.setItem("workflow", JSON.stringify(store.present));
      store.addLog("system", "success", `Undo: ${previous.label}`);
    },

    redo() {
      if (!store.future.length) return;
      const next = store.future.shift()!;

      store.past.push({
        state: JSON.parse(JSON.stringify(store.present)),
        label: next.label,
        timestamp: new Date().toLocaleTimeString(),
      });

      store.present = next.state;
      localStorage.setItem("workflow", JSON.stringify(store.present));
      store.addLog("system", "success", `Redo: ${next.label}`);
    },

    jumpToHistory(index: number) {
      const target = store.past[index];
      if (!target) return;

      // Truncate history to this point
      store.present = JSON.parse(JSON.stringify(target.state));
      store.past = store.past.slice(0, index);
      store.future = [];
      localStorage.setItem("workflow", JSON.stringify(store.present));
      store.addLog("system", "success", `Jumped to: ${target.label}`);
    },
  };
}
