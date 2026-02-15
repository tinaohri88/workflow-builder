<template>
  <div class="w-80 border-l h-full flex flex-col bg-white pointer-events-auto relative z-50 shadow-xl">
    
    <div class="p-4 border-b flex justify-between items-center bg-gray-50">
      <h3 class="font-bold capitalize text-gray-700 text-sm">
        {{ node ? `${node.type} Configuration` : 'Workflow Library' }}
      </h3>
      <button 
        @click="node ? (store.selectedNodeId = null) : emit('close')" 
        class="text-gray-400 hover:text-gray-600 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-all"
      >
        ✕
      </button>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-if="node" class="p-4 space-y-4 animate-in fade-in duration-200">
        <div class="space-y-1">
          <label class="text-xs font-semibold text-gray-500 uppercase">Display Label</label>
          <input
            class="border rounded p-2 w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            v-model="form.label"
            placeholder="e.g. Send Welcome Email"
          />
        </div>

        <hr class="border-gray-100" />

        <div v-for="(v, k) in formFields" :key="k" class="space-y-1">
          <label class="text-xs font-semibold text-gray-500 uppercase">{{ k }}</label>
          <input
            class="border rounded p-2 w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            :class="{ 'border-red-500 bg-red-50': errors[k] }"
            v-model="form[k]"
            :placeholder="`Enter ${k}...`"
          />
          <p v-if="errors[k]" class="text-[10px] text-red-500 font-medium">
            {{ errors[k] }}
          </p>
        </div>

        <div class="pt-4 space-y-2">
          <label class="text-xs font-semibold text-gray-500 uppercase block mb-2">Actions</label>
          <div class="grid grid-cols-2 gap-2">
            <button @click="duplicate" class="flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-bold transition-colors">
              Duplicate
            </button>
            <button @click="remove" class="flex items-center justify-center gap-2 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-bold transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>

      <div v-else class="p-4 space-y-6 animate-in slide-in-from-right-4 duration-200">
        <div class="space-y-3">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Load Sample Flow</label>
          
          <button @click="loadSample('leadWelcome')" class="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group">
            <div class="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">🚀 New Lead Welcome</div>
            <div class="text-[10px] text-slate-400 mt-1">Webhook → Email → HTTP → Condition → SMS</div>
          </button>

          <button @click="loadSample('paymentFailure')" class="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group">
            <div class="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">💳 Payment Recovery</div>
            <div class="text-[10px] text-slate-400 mt-1">Manual Trigger → HTTP → Branching Logic</div>
          </button>
        </div>

        <hr class="border-slate-200" />

        <div class="space-y-3">
          <label class="text-[10px] font-bold text-red-400 uppercase tracking-widest">Danger Zone</label>
          <button @click="clearCanvas" class="w-full py-2 px-3 border border-red-200 text-red-500 rounded-md text-xs font-bold hover:bg-red-50 transition-colors">
            Reset Canvas
          </button>
        </div>
      </div>
    </div>

    <div v-if="node" class="p-4 border-t bg-gray-50">
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full transition-colors disabled:opacity-50"
        :disabled="!isValid"
        @click="save"
      >
        Save Changes
      </button>
      <p v-if="!isValid" class="text-[10px] text-center mt-2 text-gray-400">Please fix errors to save</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue'
import { useWorkflowStore } from '../store/workflow'
import { schemas } from '../schemas'

const emit = defineEmits(['close'])
const store = useWorkflowStore()
const form = reactive<any>({})
const errors = ref<Record<string, string>>({})

const node = computed(() => store.present.nodes.find(n => n.id === store.selectedNodeId))

const formFields = computed(() => {
  if (!node.value) return {}
  const shape = schemas[node.value.type]?.shape || {}
  const { label, ...rest } = shape
  return rest
})

watch(() => store.selectedNodeId, (newId) => {
  Object.keys(form).forEach(k => delete form[k])
  errors.value = {}
  if (!newId) return
  const activeNode = store.present.nodes.find(n => n.id === newId)
  if (!activeNode) return
  const schemaShape = schemas[activeNode.type]?.shape || {}
  form.label = activeNode.data?.label || ''
  Object.keys(schemaShape).forEach(k => {
    if (k !== 'label') form[k] = activeNode.data?.[k] ?? ''
  })
}, { immediate: true })

const isValid = computed(() => {
  if (!node.value) return false
  const schema = schemas[node.value.type]
  if (!schema) return true
  const result = schema.safeParse(form)
  if (!result.success) {
    const formattedErrors: any = {}
    result.error.issues.forEach((issue) => {
      formattedErrors[issue.path[0]] = issue.message
    })
    errors.value = formattedErrors
    return false
  }
  errors.value = {}
  return true
})

// --- ACTIONS ---

function save() {
  if (!node.value || !isValid.value) return
  store.commit({
    ...store.present,
    nodes: store.present.nodes.map((n: any) =>
      n.id === store.selectedNodeId ? { ...n, data: { ...n.data, ...form } } : n
    ),
  }, 'Update Node Config')
}

function duplicate() {
  if (!node.value) return
  const newNode = {
    ...JSON.parse(JSON.stringify(node.value)),
    id: crypto.randomUUID(),
    position: { x: node.value.position.x + 40, y: node.value.position.y + 40 }
  }
  store.commit({ ...store.present, nodes: [...store.present.nodes, newNode] }, 'Duplicate Node')
}

function remove() {
  if (!node.value) return
  const idToDelete = node.value.id
  store.commit({
    nodes: store.present.nodes.filter((n: any) => n.id !== idToDelete),
    edges: store.present.edges.filter((e: any) => e.source !== idToDelete && e.target !== idToDelete),
  }, 'Delete Node')
  store.selectedNodeId = null
}

// --- SAMPLES LOGIC ---

const samples = {
  "leadWelcome": {
    "nodes": [
      { "id": "node-1", "type": "webhook", "position": { "x": 50, "y": 150 }, "data": { "label": "New Lead Webhook" } },
      { "id": "node-2", "type": "email", "position": { "x": 300, "y": 150 }, "data": { "label": "Welcome Email" } },
      { "id": "node-3", "type": "transform", "position": { "x": 550, "y": 150 }, "data": { "label": "Wait 1 Hour" } },
      { "id": "node-4", "type": "http", "position": { "x": 800, "y": 150 }, "data": { "label": "Update CRM" } },
      { "id": "node-5", "type": "condition", "position": { "x": 1050, "y": 130 }, "data": { "label": "Success?" } },
      { "id": "node-6", "type": "sms", "position": { "x": 1350, "y": 50 }, "data": { "label": "Notify User" } },
      { "id": "node-7", "type": "sms", "position": { "x": 1350, "y": 250 }, "data": { "label": "Notify Ops" } }
    ],
    "edges": [
      { "id": "e-1-2", "source": "node-1", "sourceHandle": null, "target": "node-2", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
      { "id": "e-2-3", "source": "node-2", "sourceHandle": null, "target": "node-3", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
      { "id": "e-3-4", "source": "node-3", "sourceHandle": null, "target": "node-4", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
      { "id": "e-4-5", "source": "node-4", "sourceHandle": null, "target": "node-5", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
      { "id": "e-5-6", "source": "node-5", "sourceHandle": "true", "target": "node-6", "targetHandle": null, "label": "True", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
      { "id": "e-5-7", "source": "node-5", "sourceHandle": "false", "target": "node-7", "targetHandle": null, "label": "False", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } }
    ]
  },
  "paymentFailure": {
    "nodes": [
      { "id": "p-node-1", "type": "manual", "position": { "x": 100, "y": 150 }, "data": { "label": "Trigger Failure" } },
      { "id": "p-node-2", "type": "http", "position": { "x": 350, "y": 150 }, "data": { "label": "Get Balance" } },
      { "id": "p-node-3", "type": "condition", "position": { "x": 600, "y": 130 }, "data": { "label": "Funds > 0?" } },
      { "id": "p-node-4", "type": "email", "position": { "x": 900, "y": 50 }, "data": { "label": "Send Retry Email" } },
      { "id": "p-node-5", "type": "sms", "position": { "x": 900, "y": 250 }, "data": { "label": "Send Cancellation" } }
    ],
    "edges": [
      { "id": "ep-1-2", "source": "p-node-1", "sourceHandle": null, "target": "p-node-2", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
      { "id": "ep-2-3", "source": "p-node-2", "sourceHandle": null, "target": "p-node-3", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
      { "id": "ep-3-4", "source": "p-node-3", "sourceHandle": "true", "target": "p-node-4", "targetHandle": null, "label": "True", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
      { "id": "ep-3-5", "source": "p-node-3", "sourceHandle": "false", "target": "p-node-5", "targetHandle": null, "label": "False", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } }
    ]
  }
}

function loadSample(key: keyof typeof samples) {
  if (confirm("Replace current workflow with this sample?")) {
    store.past = []
    store.future = []
    store.commit(samples[key], `Load Sample: ${key}`)
    store.selectedNodeId = null
    // Ensure viewport resets to see the new nodes
    window.location.reload() 
  }
}

function clearCanvas() {
  if (confirm("Delete everything?")) {
    store.commit({ nodes: [], edges: [] }, 'Clear Canvas')
    store.selectedNodeId = null
    window.location.reload()
  }
}
</script>