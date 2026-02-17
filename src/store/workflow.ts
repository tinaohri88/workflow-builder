import { defineStore } from 'pinia'


export interface WorkflowState {
 nodes: any[]
 edges: any[]
}


export interface HistoryStep {
 state: WorkflowState
 label: string
 timestamp: string
}


export interface LogEntry {
 timestamp: string
 nodeId: string
 status: 'success' | 'error' | 'skipped'
 message: string
}


const empty: WorkflowState = {
 nodes: [],
 edges: [],
}


export const useWorkflowStore = defineStore('workflow', {
 state: () => ({
   present: JSON.parse(localStorage.getItem('workflow') || 'null') || empty,
   // CHANGED: past and future now use HistoryStep for the History Panel
   past: [] as HistoryStep[],
   future: [] as HistoryStep[],
   selectedNodeId: null as string | null,
  
   // Simulation State
   isRunning: false,
   activeNodeId: null as string | null,
   logs: [] as LogEntry[],
  
   // Viewport State
   viewport: JSON.parse(localStorage.getItem('viewport') || 'null') as { x: number; y: number; zoom: number } | null,
 }),


 actions: {
   // --- CORE PERSISTENCE (UPDATED FOR HISTORY) ---
  
   /**
    * @param state The new state to commit
    * @param label Descriptive text for the History Panel (e.g., "Added Node")
    */
   commit(state: WorkflowState, label: string = 'Manual Change') {
     // Save current state to past before updating
     this.past.push({
       state: JSON.parse(JSON.stringify(this.present)),
       label,
       timestamp: new Date().toLocaleTimeString(),
     })
     this.future = []
     this.present = JSON.parse(JSON.stringify(state))
     localStorage.setItem('workflow', JSON.stringify(this.present))
   },


   undo() {
     if (!this.past.length) return
     const previous = this.past.pop()!
    
     // Move current state to future
     this.future.unshift({
       state: JSON.parse(JSON.stringify(this.present)),
       label: previous.label,
       timestamp: new Date().toLocaleTimeString(),
     })


     this.present = previous.state
     localStorage.setItem('workflow', JSON.stringify(this.present))
     this.addLog('system', 'success', `Undo: ${previous.label}`)
   },


   redo() {
     if (!this.future.length) return
     const next = this.future.shift()!
    
     this.past.push({
       state: JSON.parse(JSON.stringify(this.present)),
       label: next.label,
       timestamp: new Date().toLocaleTimeString(),
     })


     this.present = next.state
     localStorage.setItem('workflow', JSON.stringify(this.present))
     this.addLog('system', 'success', `Redo: ${next.label}`)
   },


   /**
    * Jump to a specific point in history
    */
   jumpToHistory(index: number) {
     const target = this.past[index]
     if (!target) return


     // Truncate history to this point
     this.present = JSON.parse(JSON.stringify(target.state))
     this.past = this.past.slice(0, index)
     this.future = []
     localStorage.setItem('workflow', JSON.stringify(this.present))
     this.addLog('system', 'success', `Jumped to: ${target.label}`)
   },


   // --- DATA LOADING ---
   loadWorkflow(data: WorkflowState) {
     this.past = []
     this.future = []
     this.present = JSON.parse(JSON.stringify(data))
     this.selectedNodeId = null
     localStorage.setItem('workflow', JSON.stringify(this.present))
   },


   // --- NODE & EDGE MANIPULATION ---
   duplicateNode(nodeId: string) {
     const nodeToCopy = this.present.nodes.find((n) => n.id === nodeId)
     if (!nodeToCopy) return


     const newNode = {
       ...JSON.parse(JSON.stringify(nodeToCopy)),
       id: crypto.randomUUID(),
       selected: false,
       position: {
         x: nodeToCopy.position.x + 40,
         y: nodeToCopy.position.y + 40,
       },
     }


     this.commit({
       ...this.present,
       nodes: [...this.present.nodes, newNode],
     }, `Duplicate ${nodeToCopy.type}`)
   },


   deleteNode(nodeId: string) {
     const nodeToDelete = this.present.nodes.find(n => n.id === nodeId)
     const filteredNodes = this.present.nodes.filter((n) => n.id !== nodeId)
     const filteredEdges = this.present.edges.filter(
       (e) => e.source !== nodeId && e.target !== nodeId
     )


     this.commit({
       nodes: filteredNodes,
       edges: filteredEdges,
     }, `Delete ${nodeToDelete?.type || 'Node'}`)


     if (this.selectedNodeId === nodeId) {
       this.selectedNodeId = null
     }
   },


   deleteEdge(edgeId: string) {
     const filteredEdges = this.present.edges.filter((e) => e.id !== edgeId)
     this.commit({
       ...this.present,
       edges: filteredEdges,
     }, 'Delete Edge')
   },


   clearWorkflow() {
     this.commit({ nodes: [], edges: [] }, 'Clear Canvas')
     this.selectedNodeId = null
   },


   saveViewport(viewport: { x: number; y: number; zoom: number }) {
     this.viewport = viewport
     localStorage.setItem('viewport', JSON.stringify(viewport))
   },


   // --- SIMULATION & LOGGING ---
   addLog(nodeId: string, status: 'success' | 'error' | 'skipped', message: string) {
     this.logs.unshift({
       timestamp: new Date().toLocaleTimeString(),
       nodeId,
       status,
       message
     })
   },


   async runSimulation() {
     if (this.isRunning) return
     this.isRunning = true
     this.logs = []


     // Find all trigger nodes
     const triggerNodes = this.present.nodes.filter(n =>
       n.type === 'manual' || n.type === 'webhook'
     )


     // Find the trigger node with NO incoming edges (the actual start)
     let currentNode = triggerNodes.find(trigger =>
       !this.present.edges.some(edge => edge.target === trigger.id)
     )


     // Fallback to first trigger if none found without incoming edges
     if (!currentNode && triggerNodes.length > 0) {
       currentNode = triggerNodes[0]
     }


     if (!currentNode) {
       this.addLog('system', 'error', 'No trigger node found.')
       this.isRunning = false
       return
     }


     while (currentNode && this.isRunning) {
       this.activeNodeId = currentNode.id
       this.addLog(currentNode.id, 'success', `Executing ${currentNode.type}...`)


       await new Promise(resolve => setTimeout(resolve, 1000))


       const outgoingEdges = this.present.edges.filter(e => e.source === currentNode.id)
      
       if (outgoingEdges.length === 0) {
         this.addLog(currentNode.id, 'success', 'Workflow Finished.')
         break
       }


       let nextEdge: any;


       if (currentNode.type === 'condition') {
         const conditionPassed = Math.random() > 0.3
         const branchToFollow = conditionPassed ? 'true' : 'false'
        
         this.addLog(currentNode.id, 'success', `Condition evaluated to: ${branchToFollow.toUpperCase()}`)


         nextEdge = outgoingEdges.find(e => e.sourceHandle === branchToFollow)


         outgoingEdges.forEach(e => {
           if (!nextEdge || e.id !== nextEdge.id) {
             this.addLog(e.target, 'skipped', `Branch ${e.label || ''} skipped.`)
           }
         })
       } else {
         nextEdge = outgoingEdges[0]
       }


       if (!nextEdge) {
         this.addLog(currentNode.id, 'error', 'No valid path found.')
         break
       }


       currentNode = this.present.nodes.find(n => n.id === nextEdge.target)
     }


     this.activeNodeId = null
     this.isRunning = false
   }
 },
})

