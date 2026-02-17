<template>
  <aside class="w-64 p-4 border-r bg-white space-y-6 pointer-events-auto relative z-50 shadow-md h-full">
    <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">Nodes Palette</div>
    
    <div v-for="(nodes, category) in nodeGroups" :key="category">
      <h3 class="text-sm font-semibold text-gray-700 mb-3 capitalize">{{ category }}s</h3>
      <div class="space-y-2">
        <div
          v-for="node in nodes"
          :key="node.type"
          class="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-grab hover:bg-blue-50 hover:border-blue-300 transition-all active:cursor-grabbing"
          draggable="true"
          @dragstart="onDragStart($event, node.type)"
        >
          <div :class="['w-1.5 h-6 rounded-full mr-3', node.color]"></div>
          <span class="text-sm font-medium text-gray-600">{{ node.label }}</span>
        </div>
      </div>
    </div>

    <div class="pt-4 border-t italic text-[10px] text-gray-400">
      Drag nodes onto the canvas.
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useWorkflowStore } from '../store/workflow'
import { NODE_TYPES } from '../schemas'

const store = useWorkflowStore()

/**
 * Group node types by category - derived from NODE_TYPES registry
 * This creates groups dynamically, making it scalable for new node types
 */
const nodeGroups = NODE_TYPES.reduce((groups, nodeType) => {
  if (!groups[nodeType.category]) {
    groups[nodeType.category] = []
  }
  groups[nodeType.category].push({
    type: nodeType.type,
    label: nodeType.label,
    color: nodeType.color,
    description: nodeType.description,
  })
  return groups
}, {} as Record<string, Array<{ type: string; label: string; color: string; description?: string }>>)

/**
 * Requirement: Drag/drop from palette 
 */
const onDragStart = (event: DragEvent, nodeType: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
    
    // Create a custom drag image that matches the actual node size
    const dragImage = document.createElement('div')
    dragImage.className = 'px-4 py-2 shadow-md rounded-md border-2 bg-gray-200 border-slate-200 text-slate-700'
    dragImage.style.width = '150px'
    dragImage.style.position = 'absolute'
    dragImage.style.left = '-9999px'
    dragImage.style.top = '-9999px'
    dragImage.innerHTML = `
      <div class="text-[9px] font-black text-blue-500 uppercase tracking-tight">${nodeType}</div>
      <div class="text-sm font-semibold">${nodeType.toUpperCase()}</div>
    `
    document.body.appendChild(dragImage)
    event.dataTransfer.setDragImage(dragImage, 75, 25)
    
    // Clean up the drag image after drag is complete
    setTimeout(() => {
      try {
        document.body.removeChild(dragImage)
      } catch (e) {
        // Already removed
      }
    }, 1000)
  }
}
</script>