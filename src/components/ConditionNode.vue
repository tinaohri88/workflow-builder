<template>
 <div
   class="px-4 py-4 shadow-md rounded-md bg-white border-2 transition-all duration-300 relative"
   :class="[
     selected ? 'border-orange-500 shadow-lg' : 'border-orange-400',
     isActive ? 'active-glow scale-105 z-50' : ''
   ]"
 >
   <Handle type="target" :position="Position.Left" class="!bg-slate-400" />
  
   <div class="flex flex-col items-center gap-1">
     <div class="text-[10px] font-black text-orange-500 uppercase tracking-wider">Condition</div>
     <div class="text-[10px] text-gray-400 italic">"If this then..."</div>
   </div>


   <div class="absolute right-[-6px] top-1/2 translate-y-[-50%] flex items-center">
     <Handle
       id="true"
       type="source"
       :position="Position.Right"
       class="!w-3 !h-3 !bg-green-500 border-2 border-white !static !translate-y-0"
     />
     <span class="text-[8px] font-bold text-green-600 absolute left-5">TRUE</span>
   </div>
  
   <div class="absolute bottom-[-22px] left-1/2 translate-x-[-50%] flex flex-col items-center">
     <Handle
       id="false"
       type="source"
       :position="Position.Bottom"
       class="!w-3 !h-3 !bg-red-500 border-2 border-white !static !translate-x-0"
     />
     <span class="text-[8px] font-bold text-red-600 mt-1 uppercase">False</span>
   </div>
 </div>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useWorkflowStore } from '../store/workflow'


const props = defineProps({
 id: { type: String, required: true }, // Vue Flow passes the node ID automatically
 selected: { type: Boolean, default: false },
})


const store = useWorkflowStore()


// This computed property tracks the simulation progress
const isActive = computed(() => store.activeNodeId === props.id)
</script>


<style scoped>
.active-glow {
 border-color: #3b82f6 !important; /* Blue-500 */
 background-color: #eff6ff !important; /* Blue-50 */
 animation: pulse-blue 1.5s infinite;
}


@keyframes pulse-blue {
 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
 70% { box-shadow: 0 0 0 12px rgba(59, 130, 246, 0); }
 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}


.vue-flow__handle {
 transition: transform 0.2s, background-color 0.2s;
}


.vue-flow__handle:hover {
 transform: scale(1.4);
}
</style>



