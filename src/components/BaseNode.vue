<template>
 <div
   class="px-4 py-2 shadow-md rounded-md border-2 min-w-[150px] transition-all duration-200"
   :class="[
     isActive
       ? 'border-blue-500 bg-gray-300 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105 z-50'
       : 'border-slate-200 bg-gray-200 text-slate-700'
   ]"
 >
   <Handle type="target" :position="Position.Left" class="w-2 h-2 !bg-slate-400" />


   <div class="flex flex-col">
     <div class="text-[9px] font-black text-blue-500 uppercase tracking-tight">{{ type }}</div>
     <div class="text-sm font-semibold truncate">{{ data.label || 'New Node' }}</div>
   </div>


   <Handle type="source" :position="Position.Right" class="w-2 h-2 !bg-slate-400" />
 </div>
</template>


<script setup lang="ts">
import { computed, defineProps } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useWorkflowStore } from '../store/workflow'


const props = defineProps({
 id: { type: String, required: true },
 type: { type: String },
 data: { type: Object, required: true }
})


const store = useWorkflowStore()


// Highlighting logic connected to the simulation engine - only re-compute when activeNodeId changes
const isActive = computed(() => store.activeNodeId === props.id)
</script>


<style scoped>
@keyframes pulse-border {
 0% { border-color: #3b82f6; }
 50% { border-color: #93c5fd; }
 100% { border-color: #3b82f6; }
}
</style>



