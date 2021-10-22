import { createApp } from 'vue'
import App from './app/component.vue'
import router from './app/router/index.js'
import addIcons from './add-icons.js'

addIcons(createApp(App)).use(router).mount('#app')
