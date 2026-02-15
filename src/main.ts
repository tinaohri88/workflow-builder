import { createApp } from 'vue'
import { createPinia } from 'pinia'

// import '@vue-flow/core/dist/style.css'
// import '@vue-flow/background/dist/style.css'
// import '@vue-flow/controls/dist/style.css'
/* Essential Vue Flow styles */
import '@vue-flow/core/dist/style.css';
/* Default theme (provides the circle handle look) */
import '@vue-flow/core/dist/theme-default.css';
import App from './App.vue'
import './style.css'
createApp(App).use(createPinia()).mount('#app')
