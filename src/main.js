import Vue from 'vue'
import App from './components/app/component.vue'
import router from './router'
import vueScrollBehavior from 'vue-scroll-behavior'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner, faHeadphonesAlt, faBookOpen, faFilm, faDatabase, faSave, faCog, faLink, faBars, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faSpinner, faHeadphonesAlt, faBookOpen, faFilm, faDatabase, faSave, faCog, faLink, faBars, faSync)

Vue.config.productionTip = false
Vue.use(vueScrollBehavior, { router: router })
Vue.component('font-awesome-icon', FontAwesomeIcon)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
