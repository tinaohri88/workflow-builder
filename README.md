# Workflow Builder


A visual workflow automation builder that allows users to create, configure, and simulate complex workflows through a drag-and-drop interface. Built with Vue 3 and TypeScript, this tool provides an intuitive way to design automation workflows with conditional logic, API calls, notifications, and more.


![Workflow Builder](https://img.shields.io/badge/Vue-3.4-4FC08D?logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)

## ✨ Features


- **Visual Workflow Designer**: Drag-and-drop interface for building workflows
- **Multiple Node Types**: Support for HTTP requests, email, SMS, and conditional logic
- **Real-time Validation**: Schema-based validation using Zod
- **History & Undo/Redo**: Full history tracking with descriptive labels
- **Workflow Simulation**: Preview and test workflows before deployment
- **Persistent Storage**: Auto-save to local storage
- **Responsive UI**: Clean, modern interface built with Tailwind CSS
- **Type Safety**: Full TypeScript support throughout the application


## 📋 Table of Contents


- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Usage Guide](#-usage-guide)
- [Development](#-development)
- [Contributing](#-contributing)


## 🛠 Tech Stack


### Core Framework
- **[Vue 3](https://vuejs.org/)** (v3.4) - Progressive JavaScript framework with Composition API
- **[TypeScript](https://www.typescriptlang.org/)** (v5.3) - Static typing for enhanced developer experience
- **[Vite](https://vitejs.dev/)** (v5.0) - Next-generation frontend build tool


### State Management & Data Flow
- **[Pinia](https://pinia.vuejs.org/)** (v2.1) - Intuitive, type-safe state management for Vue
- **[Zod](https://zod.dev/)** (v3.22) - TypeScript-first schema validation


### UI & Visualization
- **[Vue Flow](https://vueflow.dev/)** (v1.41) - Highly customizable flow/node editor
 - `@vue-flow/core` - Core flow functionality
 - `@vue-flow/background` - Grid/pattern backgrounds
 - `@vue-flow/controls` - Zoom and pan controls
 - `@vue-flow/minimap` - Miniature overview map
- **[Tailwind CSS](https://tailwindcss.com/)** (v3.4) - Utility-first CSS framework


## 🏗 Architecture Overview


### High-Level Architecture


```
┌─────────────────────────────────────────────────────────────┐
│                         App.vue                             │
│                    (Main Container)                         │
├───────────────┬─────────────────────────┬───────────────────┤
│               │                         │                   │
│  NodePalette  │    WorkflowCanvas       │  ConfigPanel      │
│               │    (Vue Flow)           │  HistoryPanel     │
│               │                         │                   │
└───────────────┴─────────────────────────┴───────────────────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ Pinia Store  │
                 │ (workflow.ts)│
                 └──────────────┘
                        │
                   ┌────┴────┐
                   │         │
           ┌───────▼──┐   ┌──▼───────────┐
           │  Schema  │   │ LocalStorage │
           │Validation│   │ Persistence  │
           └──────────┘   └──────────────┘
```


### Component Breakdown


#### Core Components


1. **NodePalette** (`/src/components/NodePalette.vue`)
  - Displays available node types (HTTP, Email, SMS, Condition)
  - Drag-and-drop initialization
  - Node templates and configuration


2. **WorkflowCanvas** (`/src/components/WorkflowCanvas.vue`)
  - Main workflow editing area
  - Powered by Vue Flow
  - Handles node positioning, connections, and interactions
  - Includes background grid, controls, and minimap


3. **BaseNode** & **ConditionNode** (`/src/components/`)
  - Custom node implementations
  - Validation display
  - Configuration UI


4. **ConfigPanel** (`/src/components/ConfigPanel.vue`)
  - Node configuration interface
  - Dynamic form generation based on node type
  - Real-time validation feedback


5. **HistoryPanel** (`/src/components/HistoryPanel.vue`)
  - Undo/redo functionality
  - Timestamped history entries
  - Descriptive labels for each change


### State Management


The application uses **Pinia** for centralized state management with the following structure:


```typescript
WorkflowStore {
 // Current State
 present: WorkflowState           // Active workflow
 selectedNodeId: string | null    // Currently selected node
 viewport: { x, y, zoom }         // Canvas position
  // History
 past: HistoryStep[]              // Undo stack
 future: HistoryStep[]            // Redo stack
  // Simulation
 isRunning: boolean               // Simulation state
 activeNodeId: string | null      // Current executing node
 logs: LogEntry[]                 // Execution logs
 }
```


### Data Flow


1. **User Interaction** → Component emits event
2. **Component** → Calls Pinia store action
3. **Store Action** → Updates state & commits to history
4. **State Change** → Triggers localStorage persistence
5. **Reactive Update** → Components re-render automatically


### Validation System


The application uses a dual validation approach:


1. **Zod Schemas** (`/src/schemas.ts`)
  - Runtime validation for user input
  - Type inference for TypeScript
  - Custom error messages


## 🚀 Getting Started


### Prerequisites


- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- Modern web browser with ES6+ support


### Installation


1. **Clone the repository**
  ```bash
  git clone https://github.com/yourusername/workflow-builder.git
  cd workflow-builder
  ```


2. **Install dependencies**
  ```bash
  npm install
  ```


3. **Start development server**
  ```bash
  npm run dev
  ```


4. **Open your browser**
  Navigate to `http://localhost:5173` (or the port shown in your terminal)


### Building for Production


```bash
# Build the application
npm run build
```


The built files will be in the `dist/` directory, ready to be deployed to any static hosting service.


## 📁 Project Structure


```
workflow-builder/
├── src/
│   ├── components/           # Vue components
│   │   ├── BaseNode.vue     # Base node component
│   │   ├── ConditionNode.vue # Conditional logic node
│   │   ├── ConfigPanel.vue  # Node configuration sidebar
│   │   ├── HistoryPanel.vue # Undo/redo history
│   │   ├── NodePalette.vue  # Available nodes palette
│   │   └── WorkflowCanvas.vue # Main canvas area
│   │
│   ├── store/               # Pinia store modules
│   │   └── workflow.ts      # Main workflow state
│   │
│   ├── App.vue              # Root component
│   ├── main.ts              # Application entry point
│   ├── schemas.ts           # Zod validation schemas
│   └── style.css            # Global styles & Tailwind
│
├── public/                  # Static assets
├── index.html              # HTML entry point
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── postcss.config.js       # PostCSS configuration
```


## 📖 Usage Guide


### Creating a Workflow


1. **Add Nodes**: Drag node types from the left palette onto the canvas
2. **Configure Nodes**: Click a node to open the configuration panel
3. **Connect Nodes**: Drag from output handles to input handles to create connections
4. **Validate**: The system automatically validates node configurations
5. **Save**: Changes are auto-saved to local storage


### Workflow Simulation


1. Click the `Run Preview` button
2. Watch nodes execute in sequence
3. View logs in the preview panel
4. Check for errors or conditional branches


### History & Undo


- **Undo**: Ctrl/Cmd + Z or use history panel
- **Redo**: Ctrl/Cmd + Shift + Z or use history panel
- **View History**: Click history icon to see all changes with timestamps


## 🔧 Development


### Development Scripts


```bash
# Start dev server with hot reload
npm run dev


# Build for production
npm run build
```



