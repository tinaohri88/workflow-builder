<template>
  <div class="h-screen w-screen flex overflow-hidden bg-slate-50">
    <NodePalette />

    <div class="flex-1 relative">
    <WorkflowCanvas @node-selected="isConfigOpen = true" />      
      <div class="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button 
          v-if="!isHistoryOpen"
          @click="isHistoryOpen = true"
          class="bg-white p-2 rounded-lg shadow-md hover:bg-slate-100 border border-slate-200"
          title="Open History"
        >
          🕒
        </button>
        <button 
          v-if="!isConfigOpen"
          @click="isConfigOpen = true"
          class="bg-white p-2 rounded-lg shadow-md hover:bg-slate-100 border border-slate-200"
          title="Open Library"
        >
          ⚙️
        </button>
      </div>
    </div>

    <div class="flex h-full border-l bg-white">
      <HistoryPanel 
        v-if="isHistoryOpen" 
        @close="isHistoryOpen = false" 
      />
      
      <ConfigPanel 
        v-if="isConfigOpen" 
        @close="isConfigOpen = false" 
      />
    </div>

    <RunPreview />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NodePalette from './components/NodePalette.vue'
import WorkflowCanvas from './components/WorkflowCanvas.vue'
import ConfigPanel from './components/ConfigPanel.vue'
import RunPreview from './components/RunPreview.vue'
import HistoryPanel from './components/HistoryPanel.vue'

// Reactivity State (Equivalent to const [isOpen, setIsOpen] = useState(true))
const isHistoryOpen = ref(false)
const isConfigOpen = ref(true)
</script>