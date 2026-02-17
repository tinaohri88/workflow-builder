<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import {
VueFlow,
useVueFlow,
applyNodeChanges,
applyEdgeChanges,
} from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { useWorkflowStore } from '../store/workflow'
import { useDebounceFn } from '@vueuse/core'




import BaseNode from './BaseNode.vue'
import ConditionNode from './ConditionNode.vue'




import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'




const emit = defineEmits<{
 nodeSelected: []
}>()


const store = useWorkflowStore()




// Added viewport helpers from useVueFlow
const { project, onConnect, toObject, setViewport, onViewportChange, fitView } = useVueFlow()




const nodeTypes = {
manual: BaseNode,
webhook: BaseNode,
http: BaseNode,
email: BaseNode,
sms: BaseNode,
transform: BaseNode,
condition: ConditionNode,
}




const nodes = computed(() => store.present.nodes)
const edges = computed(() => store.present.edges)




// --- 1. VIEWPORT RESTORATION & SYNC ---
onMounted(() => {
// Restore viewport if it exists in store
if (store.viewport) {
  setViewport(store.viewport)
}
window.addEventListener('keydown', handleKeyDown)
})




onUnmounted(() => {
window.removeEventListener('keydown', handleKeyDown)
})




// Sync viewport changes to store (debounced to prevent storage lag)
const debouncedViewportSync = useDebounceFn((vp) => {
store.saveViewport(vp)
}, 500)




onViewportChange((vp) => {
debouncedViewportSync(vp)
})




// --- 2. KEYBOARD SUPPORT ---
const handleKeyDown = (e: KeyboardEvent) => {
const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
if (isInput) return




const isCmdOrCtrl = e.metaKey || e.ctrlKey
const isShift = e.shiftKey
const key = e.key.toLowerCase()




if (isCmdOrCtrl && key === 'z') {
  e.preventDefault()
  isShift ? store.redo() : store.undo()
} else if (isCmdOrCtrl && key === 'y') {
  e.preventDefault()
  store.redo()
} else if ((key === 'delete' || key === 'backspace') && store.selectedNodeId) {
  e.preventDefault()
  store.deleteNode(store.selectedNodeId)
}
}




// --- 3. AUTOSAVE LOGIC ---
const debouncedSave = useDebounceFn(() => {
if (store.isDirty) store.saveWorkflow()
}, 2000)




watch(() => store.present, () => debouncedSave(), { deep: true })




// --- 4. ACYCLIC & TYPED VALIDATION ---
const isValidConnection = (connection: any) => {
const { source, target, sourceHandle, targetHandle } = connection
if (source === target) return false
 const checkCycle = (src: string, dst: string, currentEdges: any[]): boolean => {
  const targets = currentEdges.filter(e => e.source === dst).map(e => e.target)
  if (targets.includes(src)) return true
  return targets.some(t => checkCycle(src, t, currentEdges))
}




if (checkCycle(source, target, store.present.edges)) {
  store.addLog('system', 'error', 'Infinite loop detected.')
  return false
}




const sourceType = sourceHandle?.split('-')[0]
const targetType = targetHandle?.split('-')[0]
if (sourceType && targetType && sourceType !== targetType) {
  store.addLog('system', 'error', `Type mismatch: ${sourceType} vs ${targetType}`)
  return false
}
return true
}




// --- EVENT HANDLERS ---




function onNodesChange(changes: any) {
store.present.nodes = applyNodeChanges(changes, store.present.nodes)




// Selection fix: Ensure sidebar opens when node is clicked or selected
const selectChange = changes.find((c: any) => c.type === 'select')
if (selectChange && selectChange.selected) {
  store.selectedNodeId = selectChange.id
}
}




function onEdgesChange(changes: any) {
store.present.edges = applyEdgeChanges(changes, store.present.edges)
}




const onNodeClick = ({ node }: any) => {
store.selectedNodeId = node.id
emit('nodeSelected')
}




const onPaneClick = () => {
store.selectedNodeId = null
}




// --- PERSISTENCE ---
async function recordHistory(newState?: any, label: string = 'Manual Change') {
if (newState) {
  store.commit(newState, label)
  return
}
await nextTick()
const snapshot = toObject()
store.commit({ nodes: snapshot.nodes, edges: snapshot.edges }, label)
}




function onDrop(event: DragEvent) {
const type = event.dataTransfer?.getData('application/vueflow')
if (!type) return
 event.preventDefault()
 // Get the bounding rectangle of the VueFlow pane
const flowPane = (event.currentTarget as HTMLElement).querySelector('.vue-flow') as HTMLElement
if (!flowPane) return
 const bounds = flowPane.getBoundingClientRect()
 // Calculate position relative to the flow pane, accounting for zoom and pan
const projectedPos = project({
  x: event.clientX - bounds.left,
  y: event.clientY - bounds.top
})
 // Center the node on the cursor position
// Node width is 150px, height is approximately 50px
const position = {
  x: projectedPos.x - 75,  // Half of node width
  y: projectedPos.y - 25,  // Half of approximate node height
}
 const newNode = {
  id: crypto.randomUUID(),
  type,
  position,
  data: { label: `${type.toUpperCase()}` },
  // Ensure consistent dimensions matching BaseNode/ConditionNode
  style: {
    width: 150,
  },
}
recordHistory({ ...store.present, nodes: [...store.present.nodes, newNode] }, `Add ${type} Node`)
}




onConnect((params) => {
const sourceNode = store.present.nodes.find(n => n.id === params.source)
let label = ''
let labelColor = '#64748b'
if (sourceNode?.type === 'condition') {
  const isTrue = params.sourceHandle === 'true'
  label = isTrue ? 'True' : 'False'
  labelColor = isTrue ? '#10b981' : '#f43f5e'
}




const newEdge = {
  ...params,
  id: `e-${params.source}-${params.target}-${params.sourceHandle || 'default'}-${Date.now()}`,
  label,
  animated: true,
  updatable: true,
  labelStyle: { fill: labelColor, fontWeight: 700 },
  labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
}
recordHistory({ ...store.present, edges: [...store.present.edges, newEdge] }, 'Connect Nodes')
})




function onEdgeUpdate({ edge, connection }: any) {
const otherEdges = store.present.edges.filter((e) => e.id !== edge.id)
const updatedEdge = {
  ...edge,
  ...connection,
  id: `e-${connection.source}-${connection.target}-${connection.sourceHandle || 'default'}-${Date.now()}`
}
recordHistory({ nodes: store.present.nodes, edges: [...otherEdges, updatedEdge] }, 'Update Connection')
}
</script>




<template>
<div class="h-full w-full relative bg-gray-700" @drop="onDrop" @dragover.prevent>  
<VueFlow
    :nodes="nodes"
    :edges="edges"
    :node-types="nodeTypes"
    :is-valid-connection="isValidConnection"
  
    :only-render-visible-elements="true"
    :select-nodes-on-drag="false"
  
    :fit-view-on-init="true"
  
    @nodes-change="onNodesChange"
    @edges-change="onEdgesChange"
    @edge-update="onEdgeUpdate"
    @node-drag-stop="() => recordHistory(null, 'Move Node')"
    @node-click="onNodeClick"
    @pane-click="onPaneClick"
    :snap-to-grid="true"
    :snap-grid="[20, 20]"
    class="workflow-canvas"
  >
    <Background :gap="20" pattern-color="#e2e8f0" />
    <MiniMap />
    <Controls />




    <div class="absolute top-4 left-4 z-50 flex items-center gap-2">
      <button
        @click="() => fitView({ padding: 0.2, duration: 800 })"
        class="bg-white px-3 py-1.5 border border-slate-200 rounded shadow-sm text-[10px] font-bold hover:bg-slate-50 transition-colors"
      >
        🎯 Reset View
      </button>
    </div>




    <div class="absolute bottom-6 left-6 z-50 flex items-center gap-4 bg-white p-2 rounded-lg shadow-lg border border-slate-200">
      
    
      <div class="flex gap-2">
        <button @click="store.runSimulation" :disabled="store.isRunning" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-bold disabled:opacity-50 transition-colors">
          {{ store.isRunning ? 'Running...' : '▶ Run Preview' }}
        </button>
        <button v-if="store.isRunning" @click="store.isRunning = false" class="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded font-bold">⏹ Stop</button>
      </div>
    </div>
  </VueFlow>




  <div v-if="store.logs.length" class="absolute bottom-24 left-6 w-72 max-h-48 overflow-y-auto bg-slate-900/90 text-white p-3 text-[11px] rounded-lg shadow-2xl z-50 font-mono border border-slate-700">
    <div v-for="(log, i) in store.logs" :key="i" class="mb-1 border-b border-slate-800 pb-1 last:border-0">
      <span class="text-slate-500">[{{ log.timestamp }}]</span>
      <span :class="{'text-amber-400': log.status === 'skipped', 'text-emerald-400': log.status === 'success', 'text-rose-400': log.status === 'error'}" class="ml-2">
        {{ log.message }}
      </span>
    </div>
  </div>
</div>
</template>







