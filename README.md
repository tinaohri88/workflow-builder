# Workflow Builder

<div align="center">

![Workflow Builder](https://img.shields.io/badge/Vue-3.4-4FC08D?logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-2.1-yellow?logo=pinia&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)

**A powerful visual workflow automation builder for creating, configuring, and simulating complex workflows**

[Features](#-features) • [Getting Started](#-getting-started) • [Architecture](#-architecture-overview) • [Documentation](#-usage-guide)

</div>

---

## 📖 Overview

Workflow Builder is a modern, browser-based visual workflow designer that empowers users to create sophisticated automation workflows through an intuitive drag-and-drop interface. Built with cutting-edge web technologies, it provides a seamless experience for designing workflows with conditional logic, API integrations, notifications, and more.

Whether you're prototyping automation sequences, designing business processes, or building integration flows, Workflow Builder offers the flexibility and power you need with a clean, user-friendly interface.

## ✨ Features

### Core Functionality
- 🎨 **Visual Workflow Designer** - Intuitive drag-and-drop canvas for building complex workflows
- 🔗 **Node-based Architecture** - Connect multiple node types to create sophisticated automation flows
- ⚡ **Real-time Validation** - Instant feedback with schema-based validation using Zod
- 💾 **Auto-save** - Automatic persistence to browser local storage - never lose your work
- 🎯 **Smart Connections** - Visual edge routing with animated flow indicators

### Node Types
- **Triggers**: Manual trigger, Webhook endpoints
- **Actions**: HTTP requests (GET/POST/PUT/DELETE), Email, SMS notifications
- **Logic**: Conditional branching, data transformation
- **Advanced**: Custom configurations for each node type

### Developer Experience
- 🔄 **Complete History System** - Full undo/redo with descriptive labels and timestamps
- 🧪 **Workflow Simulation** - Preview and test workflows before deployment
- 🔍 **Validation Warnings** - Real-time feedback on workflow issues

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
  - [Building for Production](#building-for-production)
- [Project Structure](#-project-structure)
- [Usage Guide](#-usage-guide)
- [Development](#-development)
- [Contributing](#-contributing)


## 🛠 Tech Stack


### Core Framework
- **[Vue 3](https://vuejs.org/)** (v3.4) - Progressive JavaScript framework with Composition API
- **[TypeScript](https://www.typescriptlang.org/)** (v5.3) - Static typing for enhanced developer experience
- **[Vite](https://vitejs.dev/)** (v5.0) - Next-generation frontend build tool


### State Management & Validation

#### **[Pinia](https://pinia.vuejs.org/)** `v2.1`
- **Official State Management** - Recommended by the Vue core team
- **Type-Safe** - First-class TypeScript support with minimal configuration
- **Modular Design** - Each store is independent and can be code-split
- **DevTools Integration** - Time-travel debugging and state inspection
- **Lightweight** - Only ~1KB minified + gzipped

#### **[Zod](https://zod.dev/)** `v3.22`
- **Runtime Type Safety** - Validate data at runtime, not just compile-time
- **TypeScript Integration** - Infer TypeScript types from Zod schemas
- **Rich Validation** - Complex validation rules with custom error messages
- **Composable** - Build complex schemas from simple primitives
- **Zero Dependencies** - Lightweight and tree-shakeable

### UI & Visualization

#### **[Vue Flow](https://vueflow.dev/)** `v1.41`
- **Powerful Node Editor** - Built specifically for creating node-based UIs
- **Highly Customizable** - Complete control over node and edge rendering
- **Performance** - Handles hundreds of nodes without performance degradation
- **Built for Vue** - Native Vue 3 components with full reactivity


**Key Features:**
- Drag and drop nodes
- Auto-layout capabilities
- Custom node types
- Connection validation
- Edge animations
- Focus rings while preview

#### **[Tailwind CSS](https://tailwindcss.com/)** `v3.4`
- **Utility-First** - Build custom designs without leaving your HTML
- **Responsive** - Mobile-first responsive design system
- **Customizable** - Extensive configuration options
- **Performance** - Purges unused CSS in production for minimal bundle size
- **Developer Experience** - IntelliSense support in VS Code





## 🏗 Architecture Overview

### System Architecture

The Workflow Builder follows a modern, component-based architecture with clear separation of concerns:

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Browser Environment                         │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                      App.vue (Root)                         │     │
│  │                   Main Application Shell                    │     │
│  └────────────┬────────────────────────┬───────────────────────┘     │
│               │                        │                             │
│  ┌────────────▼──────────┐  ┌──────────▼──────────────────────┐      │
│  │   NodePalette.vue     │  │    WorkflowCanvas.vue           │      │
│  │  ┌─────────────────┐  │  │   ┌──────────────────────┐      │      │
│  │  │ Draggable Nodes │  │  │   │   Vue Flow Core      │      │      │
│  │  │  - Triggers     │  │  │   │  ┌───────────────┐   │      │      │
│  │  │  - Actions      │  │  │   │  │  BaseNode     │   │      │      │
│  │  │  - Logic        │  │  │   │  │  ConditionNode│   │      │      │
│  │  └─────────────────┘  │  │   │  └───────────────┘   │      │      │
│  └───────────────────────┘  │   │  Background/Minimap  │      │      │
│                             │   └──────────────────────┘      │      │
│  ┌─────────────────────────┐│                                 │      │
│  │  ConfigPanel.vue        ││  Event Handlers:                │      │
│  │  ┌──────────────────┐   ││   - onNodesChange               │      │
│  │  │ Dynamic Forms    │   ││   - onEdgesChange               │      │
│  │  │ Validation       │   ││   - onConnect                   │      │
│  │  │ Live Preview     │   ││   - onNodeClick                 │      │
│  │  └──────────────────┘   │└─────────────────────────────────┘      │
│  │                         │                                         │
│  │  HistoryPanel.vue       │                                         │
│  │  ┌──────────────────┐   │                                         │
│  │  │ Undo/Redo Stack  │   │                                         │
│  │  │ Timeline View    │   │                                         │
│  │  └──────────────────┘   │                                         │
│  └─────────────────────────┘                                         │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                    Pinia Store (workflow.ts)                 │    │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐   │    │
│  │  │   State     │  │   Getters    │  │    Actions         │   │    │
│  │  │  - present  │  │  - startNodes│  │  - Node Actions    │   │    │
│  │  │  - past     │  │  - validation│  │  - Edge Actions    │   │    │
│  │  │  - future   │  │    Warnings  │  │  - History Actions │   │    │
│  │  │  - selected │  │              │  │  - Simulation      │   │    │
│  │  └─────────────┘  └──────────────┘  └────────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────┘    │ 
│           │                    │                    │                │
│           ▼                    ▼                    ▼                │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐         │
│  │  localStorage   │  │ Zod Schemas  │  │  Validation      │         │
│  │  - Workflow     │  │ - emailSchema│  │  - Schema Check  │         │
│  │  - Viewport     │  │ - httpSchema │  │  - Flow Valid    │         │
│  │  - Auto-save    │  │ - smsSchema  │  │  - Warnings      │         │
│  └─────────────────┘  └──────────────┘  └──────────────────┘         │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### **1. Application Shell (App.vue)**
The root component that orchestrates the entire application layout.

**Responsibilities:**
- Layout management (3-column design)
- Panel visibility state
- Component composition
- Global event coordination


#### **2. Node Palette (NodePalette.vue)**
Left sidebar containing all available node types that can be dragged onto the canvas.

**Responsibilities:**
- Display categorized nodes (Triggers, Actions, Logic)
- Implement drag-and-drop initialization
- Node template management

**Data Flow:**
```
User Drags Node → Generate UUID → Create Node Object → Emit to Canvas → Store Commit
```

#### **3. Workflow Canvas (WorkflowCanvas.vue)**
The main workspace where users build their workflows using Vue Flow.

**Responsibilities:**
- Render nodes and edges
- Handle user interactions (drag, connect, select)
- Viewport management (zoom, pan)
- Visual feedback (grid, minimap, controls)

#### **4. Node Components**

##### **BaseNode.vue**
Generic node component for most node types (HTTP, Email, SMS, etc.).

**Features:**
- Display node label and type
- Show validation errors
- Connection handles (input/output)
- Selection state visualization

##### **ConditionNode.vue**
Specialized component for conditional branching logic.

**Features:**
- Two output handles (True/False)
- Condition preview
- Enhanced visual styling

#### **5. Configuration Panel (ConfigPanel.vue)**
Right sidebar for editing selected node properties.

**Responsibilities:**
- Dynamic form generation based on node type
- Real-time validation with Zod schemas
- Error display and feedback

**Validation Flow:**
```
User Input → Zod Schema Validation → Error Display → Store Update (if valid)
```

#### **6. History Panel (HistoryPanel.vue)**
Right sidebar showing workflow history with undo/redo capabilities.

**Responsibilities:**
- Display chronological history with timestamps
- Undo/redo operations
- History navigation
- History pruning (max size limit)


### State Management Architecture

#### **Pinia Store Structure**

```typescript
// State
interface StoreState {
  // Workflow state with time-travel
  present: WorkflowState      // Current active state
  past: HistoryStep[]         // Undo stack
  future: HistoryStep[]       // Redo stack
  
  // UI state
  selectedNodeId: string | null
  viewport: ViewportState | null
  
  // Simulation state
  isRunning: boolean
  activeNodeId: string | null
  logs: LogEntry[]
  selectedStartNodeId: string | null
  
  // Performance optimization
  pendingNodeDrag: boolean
  maxHistorySize: number
}
```

#### **Action Modules**

The store uses a modular action pattern for better organization:

**1. Node Actions (nodeActions.ts)**
- `duplicateNode()` - Clone existing nodes
- `deleteNode()` - Remove nodes and connected edges

**2. Edge Actions (edgeActions.ts)**
- `addEdge()` - Create new connections
- `removeEdge()` - Delete connections
- Edge validation

**3. History Actions (historyActions.ts)**
- `commit()` - Save state to history
- `undo()` - Revert to previous state
- `redo()` - Restore future state

**4. Persistence Actions (persistenceActions.ts)**
- `saveToLocalStorage()` - Auto-save workflow
- `loadFromLocalStorage()` - Restore on launch
- `clearStorage()` - Reset application

**5. Simulation Actions (simulationActions.ts)**
- `runSimulation()` - Execute workflow
- `stopSimulation()` - Cancel execution

### Data Flow Patterns

#### **1. User Creates Workflow**
```
User Action → Component Event → Store Action → State Update → 
localStorage → Component Re-render
```

#### **2. Validation Flow**
```
Node Data → Zod Schema → Validation Result → UI Feedback → 
Store Update (if valid)
```

#### **3. History Management**
```
State Change → commit() → 
  Save to Past Stack → 
  Clear Future Stack → 
  Update Present → 
  Trim History (if needed) → 
  Persist to localStorage
```

#### **4. Simulation Execution**
```
Start Node Selection → 
  Topological Sort → 
  Execute Node → 
    Log Result → 
    Evaluate Conditions → 
  Execute Next Node → 
  Complete/Error
```

### Validation System

#### **Schema-Based Validation**

Each node type has a dedicated Zod schema:

```typescript
const httpSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().url("Must be a valid URL"),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
})
```

**Benefits:**
- Type inference for TypeScript
- Runtime validation
- Custom error messages
- Composable schemas

#### **Workflow Validation**

Beyond node validation, the system checks:
- **Orphaned Nodes** - Nodes without connections
- **Missing Start Nodes** - No trigger nodes
- **Circular Dependencies** - Infinite loops
- **Unreachable Nodes** - Disconnected subgraphs

### Performance Optimizations

#### **1. Lazy Updates**
- Node drag operations are batched to avoid excessive re-renders
- `pendingNodeDrag` flag prevents history commits during drag

#### **2. History Pruning**
- Maximum history size (default: 50 steps)
- Prevents memory leaks from unlimited undo stack

#### **3. Local Storage Throttling**
- Debounced saves to avoid excessive write operations
- Viewport state saved separately from workflow data

#### **4. Vue Flow Optimizations**
- Only render visible nodes
- Edge path memoization
- Virtual scrolling for large workflows

---


## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

#### Required
- **Node.js** (v18.0.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
  
- **npm** (v9.0.0 or higher) or **yarn** (v1.22.0+) or **pnpm** (v8.0.0+)
  - npm comes with Node.js
  - Verify installation: `npm --version`


### Installation

#### 1. Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/yourusername/workflow-builder.git

# Using SSH
git clone git@github.com:yourusername/workflow-builder.git

# Navigate to the project directory
cd workflow-builder
```

#### 2. Install Dependencies

Choose your preferred package manager:

```bash
# Using npm
npm install
```


### Running the Application

#### Development Mode

Start the development server with hot module replacement:

```bash
# Using npm
npm run dev
```

#### Production Preview

Test the production build locally:

```bash
# Build the application first
npm run build
```





#### **Source Code Organization**

##### **Components (`src/components/`)**
Each component is a self-contained Vue 3 Single File Component (SFC):
- **Template** - HTML structure
- **Script** - TypeScript logic with Composition API
- **Style** - Scoped or global CSS

##### **Store (`src/store/`)**
Modular Pinia store architecture:
- **`workflow.ts`** - Main store definition with state and getters
- **`actions/`** - Separated action modules for better organization
- **`helpers/`** - Pure functions for complex logic
- **`types/`** - TypeScript interfaces and types
- **`constants.ts`** - Shared constants (storage keys, limits, defaults)


## 📖 Usage Guide

### Quick Start Tutorial

#### 1. Creating Your First Workflow

**Step 1: Add a Trigger Node**
1. Find the "Triggers" section in the left NodePalette
2. Drag the "Manual Trigger" node onto the canvas
3. This will be your workflow's starting point

**Step 2: Configure the Trigger**
1. Click on the trigger node to select it
2. The ConfigPanel opens on the right
3. Set a descriptive label (e.g., "Start Process")
4. Click "Save" or the label will auto-save

**Step 3: Add an Action Node**
1. Drag an "HTTP Request" node from the Actions section
2. Position it to the right of your trigger
3. Click to select and configure:
   - **Label**: "Fetch User Data"
   - **URL**: `https://api.example.com/users/1`
   - **Method**: GET

**Step 4: Connect the Nodes**
1. Hover over the trigger node's right edge
2. You'll see an output handle (small circle)
3. Click and drag from the handle to the HTTP node
4. Release to create the connection

**Step 5: Add Conditional Logic** (Optional)
1. Drag a "Condition" node onto the canvas
2. Connect the HTTP node to the condition node
3. Configure the condition:
   - **Variable**: `response.status`
   - **Operator**: `==`
   - **Value**: `200`

**Step 6: Add Final Actions**
1. Drag two "Email" nodes onto the canvas
2. Connect the condition's "True" output to one email (success notification)
3. Connect the "False" output to the other (error notification)
4. Configure each email with appropriate recipients and messages

#### 2. Node Types & Configuration

##### **Trigger Nodes**

| Node Type | Purpose | Configuration |
|-----------|---------|---------------|
| **Manual Trigger** | Start workflow manually | Label only |
| **Webhook** | HTTP endpoint trigger | Label, webhook path |

##### **Action Nodes**

| Node Type | Purpose | Configuration |
|-----------|---------|---------------|
| **HTTP Request** | Call external APIs | Label, URL, Method (GET/POST/PUT/DELETE) |
| **Email** | Send email notifications | Label, Recipient (email), Subject |
| **SMS** | Send text messages | Label, Phone Number (E.164 format) |

##### **Logic Nodes**

| Node Type | Purpose | Configuration |
|-----------|---------|---------------|
| **Condition** | Branch based on logic | Label, Variable, Operator (==, !=, >, <), Value |
| **Transform** | Transform data | Label, Expression |

#### 3. Canvas Operations

##### **Navigation**
- **Pan**: Click and drag on the canvas background
- **Zoom In/Out**: Mouse wheel or use the controls (bottom-right)
- **Fit View**: Click the fit-view button in controls
- **Reset Zoom**: Double-click the background

##### **Node Operations**
- **Move**: Click and drag a node
- **Select**: Click on a node
- **Multi-select**: Ctrl/Cmd + Click multiple nodes
- **Delete**: Select node(s) and press Delete/Backspace
- **Duplicate**: Use the action in ConfigPanel

##### **Edge Operations**
- **Create**: Drag from output handle to input handle
- **Delete**: Select edge and press Delete
- **Reconnect**: Click on edge endpoint and drag to new handle

##### **Keyboard Shortcuts**
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Delete/Backspace` | Delete selected node/edge |
| `Escape` | Deselect all |

#### 4. Validation & Error Handling

##### **Real-time Validation**
The application validates your workflow continuously:

**Node Validation:**
- ✅ Green border = All fields valid
- ❌ Red border = Configuration errors
- ⚠️ Yellow border = Warnings (optional fields)

**Error Messages:**
- Displayed inside the node
- Details shown in ConfigPanel


#### 5. History & Undo/Redo

##### **History Panel**
Access the history panel by clicking the 🕒 icon (top-right).

**Features:**
- **Chronological List**: All workflow changes with timestamps
- **Descriptive Labels**: "Add HTTP Node", "Connect nodes", etc.
- **One-Click Restore**: Click any history entry to restore
- **Clear History**: Reset all history (keeps current state)


##### **Undo/Redo**
- **Undo**: Ctrl/Cmd + Z or click "Undo" in history panel
- **Redo**: Ctrl/Cmd + Shift + Z or click "Redo"
- **Limit**: Last 50 actions (configurable in code)

#### 6. Workflow Simulation

##### **Running a Simulation**
1. Create a complete workflow with at least one trigger
2. Click "Run Workflow" button
3. Select a start node (if multiple triggers exist)
4. Watch the execution:
   - Active node highlighted in blue
   - Edges animate during execution
   - Logs appear in real-time


#### 7. Persistence & Data Management

##### **Auto-Save**
- **Automatic**: Every change is saved to browser localStorage
- **Instant**: No delay or loading indicators needed
- **Persistent**: Survives browser refresh and restart