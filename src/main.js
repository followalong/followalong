import { createApp } from 'vue'
import App from './components/app/component.vue'
import router from './router'
import addIcons from './add-icons.js'

addIcons(createApp(App)).use(router).mount('#app')
