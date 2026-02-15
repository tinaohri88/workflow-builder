<template>
  <div class="flex flex-col h-full bg-white border-l border-slate-200 w-64 shadow-xl">
    <div class="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
      <h3 class="text-sm font-bold text-slate-700 flex items-center gap-2">
        <span>🕒</span> Activity History
      </h3>
      
      <button 
        @click="emit('close')" 
        class="text-slate-400 hover:text-slate-600 hover:bg-slate-200 w-6 h-6 rounded flex items-center justify-center transition-colors"
      >
        <span class="text-xl leading-none">&times;</span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-if="store.past.length === 0" class="text-center py-10">
        <p class="text-xs text-slate-400 italic">No changes recorded yet. [cite: 35]</p>
      </div>

      <div class="flex flex-col-reverse gap-3">
        <div class="relative pl-6 pb-2 border-l-2 border-blue-500">
          <div class="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
          <p class="text-[11px] font-bold text-blue-600 uppercase">Current State [cite: 9, 27]</p>
          <p class="text-[10px] text-slate-400 italic">Latest version</p>
        </div>

        <div 
          v-for="(step, index) in store.past" 
          :key="index"
          @click="store.jumpToHistory(index)"
          class="relative pl-6 pb-2 border-l-2 border-slate-200 group cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div class="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-slate-300 group-hover:bg-blue-400 border-2 border-white transition-colors"></div>
          
          <div class="flex flex-col bg-slate-50 p-2 rounded group-hover:bg-blue-50 border border-transparent group-hover:border-blue-100 transition-all">
            <span class="text-[11px] font-semibold text-slate-700 group-hover:text-blue-700">
              {{ step.label }}
            </span>
            <span class="text-[9px] text-slate-400">{{ step.timestamp }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 border-t border-slate-100 flex gap-2">
      <button 
        @click="store.undo" 
        :disabled="!store.past.length"
        class="flex-1 text-[10px] font-bold py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded uppercase tracking-wider transition-colors"
      >
        Undo [cite: 9, 27]
      </button>
      <button 
        @click="store.redo" 
        :disabled="!store.future.length"
        class="flex-1 text-[10px] font-bold py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded uppercase tracking-wider transition-colors"
      >
        Redo [cite: 27]
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkflowStore } from '../store/workflow'

// Define the custom event
const emit = defineEmits(['close'])

const store = useWorkflowStore()
</script>