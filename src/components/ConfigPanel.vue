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


         <button @click="loadSample('ecommerceOrder')" class="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-purple-400 hover:shadow-md transition-all group">
           <div class="text-xs font-bold text-slate-700 group-hover:text-purple-600 transition-colors">📦 E-Commerce Order (Large Graph)</div>
           <div class="text-[10px] text-slate-400 mt-1">25+ nodes • Complex branching • Performance test</div>
         </button>


         <button @click="loadSample('massiveOrder')" class="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-red-400 hover:shadow-md transition-all group">
           <div class="text-xs font-bold text-slate-700 group-hover:text-red-600 transition-colors">🔥 Massive Order System (200+ Nodes)</div>
           <div class="text-[10px] text-slate-400 mt-1">Multi-warehouse • Full system stress test</div>
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


// --- GENERATE MASSIVE WORKFLOW ---


function generateMassiveWorkflow() {
 const nodes: any[] = []
 const edges: any[] = []
 let nodeId = 0
 let edgeId = 0
  const createNode = (type: string, label: string, x: number, y: number) => {
   const id = `m-${nodeId++}`
   nodes.push({ id, type, position: { x, y }, data: { label } })
   return id
 }
  const createEdge = (source: string, target: string, label = "") => {
   const id = `me-${edgeId++}`
   edges.push({
     id,
     source,
     target,
     sourceHandle: null,
     targetHandle: null,
     label,
     animated: true,
     updatable: true,
     labelStyle: { fill: "#64748b", fontWeight: 700 },
     labelBgStyle: { fill: "white", fillOpacity: 0.8 }
   })
   return id
 }


 const createConditionEdge = (source: string, target: string, condition: string) => {
   const id = `me-${edgeId++}`
   const isTrue = condition === "true"
   edges.push({
     id,
     source,
     target,
     sourceHandle: condition,
     targetHandle: null,
     label: condition.toUpperCase(),
     animated: true,
     updatable: true,
     labelStyle: { fill: isTrue ? "#10b981" : "#f43f5e", fontWeight: 700 },
     labelBgStyle: { fill: "white", fillOpacity: 0.8 }
   })
   return id
 }


 // Entry point
 const entry = createNode("webhook", "Order Received", 0, 500)
  // Order validation pipeline
 const validate1 = createNode("http", "Validate Email", 200, 450)
 const validate2 = createNode("http", "Check Inventory", 200, 550)
 const validate3 = createNode("condition", "All Valid?", 400, 500)
 const reject = createNode("email", "Rejection Notice", 550, 300)
  createEdge(entry, validate1)
 createEdge(entry, validate2)
 createEdge(validate1, validate3)
 createEdge(validate2, validate3)
 createConditionEdge(validate3, reject, "false")
  // Payment processing
 const payment = createNode("http", "Process Payment", 600, 500)
 createConditionEdge(validate3, payment, "true")
  const paymentRetry = createNode("condition", "Payment OK?", 800, 500)
 createEdge(payment, paymentRetry)
  const paymentFail = createNode("email", "Payment Failed Email", 950, 350)
 const paymentSuccess = createNode("sms", "Payment Confirmation SMS", 950, 650)
  createConditionEdge(paymentRetry, paymentFail, "false")
 createConditionEdge(paymentRetry, paymentSuccess, "true")
  // Regional warehouse routing
 const regions = ["US-East", "US-West", "EU-Central", "Asia-Pacific", "LATAM"]
 const routingCheck = createNode("condition", "Optimal Region?", 1150, 500)
 createEdge(paymentSuccess, routingCheck)
  // True path: distribute to all regions
 const regionRouter = createNode("http", "Route to Region", 1350, 500)
 createConditionEdge(routingCheck, regionRouter, "true")
  // False path: fallback handling
 const regionFallback = createNode("email", "Regional Fallback Notification", 1350, 650)
 createConditionEdge(routingCheck, regionFallback, "false")
  let regionJoins: string[] = []
  // Create regional branches
 regions.forEach((region, regionIdx) => {
   const baseX = 1600 + regionIdx * 600
   const baseY = 200 + regionIdx * 150
  
   // Region warehouse check
   const warehouse = createNode("http", `${region} Warehouse Check`, baseX, baseY)
   createEdge(regionRouter, warehouse)
  
   // Inventory reservation
   const reserve = createNode("http", `${region} Reserve Inventory`, baseX, baseY + 80)
   createEdge(warehouse, reserve)
  
   // Pick items
   const pick = createNode("transform", `${region} Pick Items`, baseX, baseY + 160)
   createEdge(reserve, pick)
  
   // Quality check
   const qc = createNode("condition", `${region} QC Pass?`, baseX + 150, baseY + 160)
   createEdge(pick, qc)
  
   // QC fail - restock
   const restock = createNode("http", `${region} Restock Items`, baseX + 300, baseY + 80)
   createConditionEdge(qc, restock, "false")
   createEdge(restock, pick) // Loop back
  
   // Pack items
   const pack = createNode("transform", `${region} Pack Order`, baseX + 150, baseY + 240)
   createConditionEdge(qc, pack, "true")
  
   // Generate label
   const label = createNode("http", `${region} Generate Label`, baseX + 150, baseY + 320)
   createEdge(pack, label)
  
   // Ship
   const ship = createNode("http", `${region} Ship Order`, baseX + 150, baseY + 400)
   createEdge(label, ship)
  
   // Tracking
   const tracking = createNode("http", `${region} Send Tracking`, baseX + 150, baseY + 480)
   createEdge(ship, tracking)
  
   // Delivery notification
   const delivery = createNode("email", `${region} Delivery Email`, baseX + 150, baseY + 560)
   createEdge(tracking, delivery)
  
   // Customer SMS reminder
   const sms = createNode("sms", `${region} SMS Reminder`, baseX + 300, baseY + 560)
   createEdge(delivery, sms)
  
   // Chat notification
   const chat = createNode("http", `${region} Chat Notification`, baseX + 450, baseY + 560)
   createEdge(sms, chat)
  
   regionJoins.push(chat)
 })
  // Connect fallback to merge
 regionJoins.push(regionFallback)
  // Merge regions
 const merge = createNode("transform", "Merge Region Status", 5500, 500)
 regionJoins.forEach(region => {
   createEdge(region, merge)
 })
  // Post-delivery processing
 const postDeliver = createNode("http", "Update Order Status", 5700, 500)
 createEdge(merge, postDeliver)
  // Request review
 const requestReview = createNode("http", "Request Product Review", 5900, 500)
 createEdge(postDeliver, requestReview)
  // Review condition
 const reviewCheck = createNode("condition", "Review Submitted?", 6100, 500)
 createEdge(requestReview, reviewCheck)
  // Store review path
 const storeReview = createNode("http", "Store Review", 6300, 400)
 createConditionEdge(reviewCheck, storeReview, "true")
  // Low rating escalation
 const lowRating = createNode("condition", "Low Rating?", 6500, 400)
 createEdge(storeReview, lowRating)
  const escalate = createNode("email", "Escalate to Support", 6700, 300)
 const supportTicket = createNode("manual", "Customer Support Ticket", 6700, 500)
  createConditionEdge(lowRating, escalate, "true")
 createConditionEdge(lowRating, supportTicket, "false")
  // No review path
 const noReview = createNode("email", "Reminder Email", 6300, 600)
 createConditionEdge(reviewCheck, noReview, "false")
  // Analytics and reporting
 const analytics = createNode("http", "Log to Analytics", 6900, 450)
 createEdge(supportTicket, analytics)
 createEdge(escalate, analytics)
 createEdge(noReview, analytics)
 createEdge(storeReview, analytics)
  // Returns processing (triggered by separate webhook)
 const returnEntry = createNode("webhook", "Return Initiated", 100, 1000)
 const validateReturn = createNode("http", "Validate Return Request", 300, 1000)
 createEdge(returnEntry, validateReturn)
  const returnCheck = createNode("condition", "Return Valid?", 500, 1000)
 createEdge(validateReturn, returnCheck)
  const acceptReturn = createNode("email", "Return Accepted Email", 700, 900)
 const rejectReturn = createNode("email", "Return Rejected Email", 700, 1100)
  createConditionEdge(returnCheck, acceptReturn, "true")
 createConditionEdge(returnCheck, rejectReturn, "false")
  const generateLabel2 = createNode("http", "Generate Return Label", 900, 900)
 createEdge(acceptReturn, generateLabel2)
  const trackReturn = createNode("http", "Track Return Shipment", 1100, 900)
 createEdge(generateLabel2, trackReturn)
  const processRefund = createNode("http", "Process Refund", 1300, 900)
 createEdge(trackReturn, processRefund)
  const refundConfirm = createNode("email", "Refund Confirmation Email", 1500, 900)
 createEdge(processRefund, refundConfirm)
  const returnAnalytics = createNode("http", "Log Return to Analytics", 1700, 900)
 createEdge(refundConfirm, returnAnalytics)
 createEdge(rejectReturn, returnAnalytics)
  // Final reporting
 const finalReport = createNode("http", "Generate Daily Report", 7100, 450)
 createEdge(analytics, finalReport)
 createEdge(returnAnalytics, finalReport)
  const emailReport = createNode("email", "Email Report to Ops", 7300, 450)
 createEdge(finalReport, emailReport)
  const complete = createNode("transform", "Workflow Complete", 7500, 450)
 createEdge(emailReport, complete)
  return { nodes, edges }
}


const massiveWorkflowData = generateMassiveWorkflow()


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
 },
 "ecommerceOrder": {
   "nodes": [
     { "id": "ec-1", "type": "webhook", "position": { "x": 50, "y": 200 }, "data": { "label": "Order Received" } },
     { "id": "ec-2", "type": "http", "position": { "x": 300, "y": 200 }, "data": { "label": "Verify Payment" } },
     { "id": "ec-3", "type": "condition", "position": { "x": 550, "y": 150 }, "data": { "label": "Payment OK?" } },
     { "id": "ec-4", "type": "email", "position": { "x": 800, "y": 50 }, "data": { "label": "Payment Failed Email" } },
     { "id": "ec-5", "type": "sms", "position": { "x": 800, "y": 350 }, "data": { "label": "Confirm Order SMS" } },
     { "id": "ec-6", "type": "http", "position": { "x": 1050, "y": 350 }, "data": { "label": "Reserve Inventory" } },
     { "id": "ec-7", "type": "condition", "position": { "x": 1300, "y": 300 }, "data": { "label": "In Stock?" } },
     { "id": "ec-8", "type": "email", "position": { "x": 1550, "y": 150 }, "data": { "label": "Out of Stock Email" } },
     { "id": "ec-9", "type": "sms", "position": { "x": 1550, "y": 450 }, "data": { "label": "Ready to Ship SMS" } },
     { "id": "ec-10", "type": "transform", "position": { "x": 1800, "y": 450 }, "data": { "label": "Wait for Hub" } },
     { "id": "ec-11", "type": "http", "position": { "x": 2050, "y": 450 }, "data": { "label": "Create Shipment" } },
     { "id": "ec-12", "type": "condition", "position": { "x": 2300, "y": 400 }, "data": { "label": "Shipping OK?" } },
     { "id": "ec-13", "type": "email", "position": { "x": 2550, "y": 250 }, "data": { "label": "Shipping Error Alert" } },
     { "id": "ec-14", "type": "email", "position": { "x": 2550, "y": 500 }, "data": { "label": "Tracking Email" } },
     { "id": "ec-15", "type": "http", "position": { "x": 2800, "y": 500 }, "data": { "label": "Update Order Status" } },
     { "id": "ec-16", "type": "webhook", "position": { "x": 3050, "y": 500 }, "data": { "label": "Notify Analytics" } },
     { "id": "ec-17", "type": "sms", "position": { "x": 3300, "y": 500 }, "data": { "label": "Delivery Confirmation" } },
     { "id": "ec-18", "type": "email", "position": { "x": 3550, "y": 400 }, "data": { "label": "Thank You Email" } },
     { "id": "ec-19", "type": "http", "position": { "x": 3800, "y": 400 }, "data": { "label": "Request Review" } },
     { "id": "ec-20", "type": "condition", "position": { "x": 4050, "y": 350 }, "data": { "label": "Review Submitted?" } },
     { "id": "ec-21", "type": "http", "position": { "x": 4300, "y": 250 }, "data": { "label": "Store Review" } },
     { "id": "ec-22", "type": "email", "position": { "x": 4300, "y": 450 }, "data": { "label": "Low Rating Alert" } },
     { "id": "ec-23", "type": "manual", "position": { "x": 4550, "y": 350 }, "data": { "label": "Support Ticket" } },
     { "id": "ec-24", "type": "transform", "position": { "x": 4800, "y": 350 }, "data": { "label": "Complete Flow" } }
   ],
   "edges": [
     { "id": "ec-e-1-2", "source": "ec-1", "sourceHandle": null, "target": "ec-2", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-2-3", "source": "ec-2", "sourceHandle": null, "target": "ec-3", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-3-4", "source": "ec-3", "sourceHandle": "false", "target": "ec-4", "targetHandle": null, "label": "False", "animated": true, "updatable": true, "labelStyle": { "fill": "#f43f5e", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-3-5", "source": "ec-3", "sourceHandle": "true", "target": "ec-5", "targetHandle": null, "label": "True", "animated": true, "updatable": true, "labelStyle": { "fill": "#10b981", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-5-6", "source": "ec-5", "sourceHandle": null, "target": "ec-6", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-6-7", "source": "ec-6", "sourceHandle": null, "target": "ec-7", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-7-8", "source": "ec-7", "sourceHandle": "false", "target": "ec-8", "targetHandle": null, "label": "False", "animated": true, "updatable": true, "labelStyle": { "fill": "#f43f5e", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-7-9", "source": "ec-7", "sourceHandle": "true", "target": "ec-9", "targetHandle": null, "label": "True", "animated": true, "updatable": true, "labelStyle": { "fill": "#10b981", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-9-10", "source": "ec-9", "sourceHandle": null, "target": "ec-10", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-10-11", "source": "ec-10", "sourceHandle": null, "target": "ec-11", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-11-12", "source": "ec-11", "sourceHandle": null, "target": "ec-12", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-12-13", "source": "ec-12", "sourceHandle": "false", "target": "ec-13", "targetHandle": null, "label": "False", "animated": true, "updatable": true, "labelStyle": { "fill": "#f43f5e", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-12-14", "source": "ec-12", "sourceHandle": "true", "target": "ec-14", "targetHandle": null, "label": "True", "animated": true, "updatable": true, "labelStyle": { "fill": "#10b981", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-14-15", "source": "ec-14", "sourceHandle": null, "target": "ec-15", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-15-16", "source": "ec-15", "sourceHandle": null, "target": "ec-16", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-16-17", "source": "ec-16", "sourceHandle": null, "target": "ec-17", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-17-18", "source": "ec-17", "sourceHandle": null, "target": "ec-18", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-18-19", "source": "ec-18", "sourceHandle": null, "target": "ec-19", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-19-20", "source": "ec-19", "sourceHandle": null, "target": "ec-20", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-20-21", "source": "ec-20", "sourceHandle": "true", "target": "ec-21", "targetHandle": null, "label": "True", "animated": true, "updatable": true, "labelStyle": { "fill": "#10b981", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-20-22", "source": "ec-20", "sourceHandle": "false", "target": "ec-22", "targetHandle": null, "label": "False", "animated": true, "updatable": true, "labelStyle": { "fill": "#f43f5e", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-22-23", "source": "ec-22", "sourceHandle": null, "target": "ec-23", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-21-24", "source": "ec-21", "sourceHandle": null, "target": "ec-24", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } },
     { "id": "ec-e-23-24", "source": "ec-23", "sourceHandle": null, "target": "ec-24", "targetHandle": null, "label": "", "animated": true, "updatable": true, "labelStyle": { "fill": "#64748b", "fontWeight": 700 }, "labelBgStyle": { "fill": "white", "fillOpacity": 0.8 } }
   ]
 },
 "massiveOrder": massiveWorkflowData
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



