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
      Drag nodes onto the canvas or click to add at center.
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useWorkflowStore } from '../store/workflow'

const store = useWorkflowStore()

// Requirement: Specific Node Types 
const nodeGroups = {
  trigger: [
    { type: 'manual', label: 'Manual Trigger', color: 'bg-green-500' },
    { type: 'webhook', label: 'Webhook', color: 'bg-green-600' },
  ],
  action: [
    { type: 'http', label: 'HTTP Request', color: 'bg-blue-500' },
    { type: 'email', label: 'Email', color: 'bg-blue-400' },
    { type: 'sms', label: 'SMS', color: 'bg-indigo-400' },
  ],
  logic: [
    { type: 'condition', label: 'Condition', color: 'bg-orange-500' },
    { type: 'transform', label: 'Transform', color: 'bg-orange-600' },
  ],
}

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
    dragImage.style.top = '-1000px'
    dragImage.innerHTML = `
      <div class="text-[9px] font-black text-blue-500 uppercase tracking-tight">${nodeType}</div>
      <div class="text-sm font-semibold">${nodeType.toUpperCase()}</div>
    `
    document.body.appendChild(dragImage)
    event.dataTransfer.setDragImage(dragImage, 75, 25)
    
    // Clean up the drag image after a short delay
    setTimeout(() => document.body.removeChild(dragImage), 0)
  }
}
</script>