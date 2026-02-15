<template>
  <button
    class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded"
    @click="run"
  >
    ▶ Run
  </button>
</template>

<script setup lang="ts">
import { useWorkflowStore } from '../store/workflow'
const store = useWorkflowStore()

async function run() {
  for (const node of store.present.nodes) {
    console.log('Executing:', node.type, node.data)
    await new Promise(r => setTimeout(r, 500))
  }
  alert('Workflow finished (simulated)')
}
</script>
