<template>
  <div
    class="w-48 p-3 border-r space-y-2 bg-white pointer-events-auto relative z-50"
  >
    <button
      v-for="t in types"
      :key="t"
      class="w-full bg-gray-200 p-2 rounded cursor-pointer"
      @click="add(t)"
    >
      + {{ t }}
    </button>
  </div>
</template>


<script setup lang="ts">
import { useWorkflowStore } from '../store/workflow'
const store = useWorkflowStore()
const types = ['trigger', 'action', 'condition']

function add(type: keyof typeof schemas) {
  const index = store.present.nodes.length

  store.commit({
    ...store.present,
    nodes: [
      ...store.present.nodes,
      {
        id: crypto.randomUUID(),
        type, // 🔴 important
        position: {
          x: 150 + index * 40,
          y: 150 + index * 40,
        },
        data: {
          label: type,
        },
      },
    ],
  })
}


</script>
