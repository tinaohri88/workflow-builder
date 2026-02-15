<template>
  <div class="h-full w-full relative pointer-events-none">
    <VueFlow
      class="h-full w-full pointer-events-auto"
      :nodes="nodes"
      :edges="edges"
      @nodes-change="onNodes"
      @edges-change="onEdges"
      @connect="onConnect"
      @node-click="onSelect"
       fit-view
    >
      <Background />
      <Controls />
    </VueFlow>
    

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { applyNodeChanges, applyEdgeChanges } from '@vue-flow/core'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { useWorkflowStore } from '../store/workflow'

const store = useWorkflowStore()

// ✅ wrap store access in computed refs
const nodes = computed(() => store.present.nodes)
const edges = computed(() => store.present.edges)
console.log(nodes);
function onNodes(changes: any) {
  store.commit({
    ...store.present,
    nodes: applyNodeChanges(changes, store.present.nodes),
  })
}

function onEdges(changes: any) {
  store.commit({
    ...store.present,
    edges: applyEdgeChanges(changes, store.present.edges),
  })
}

function onConnect(connection: any) {
  store.commit({
    ...store.present,
    edges: [...store.present.edges, connection],
  })
}

function onSelect({ node }: any) {
  console.log('here')
  store.selectNode(node.id)
}
</script>
