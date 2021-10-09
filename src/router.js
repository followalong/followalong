import { createRouter, createWebHistory } from 'vue-router'
import About from './views/about/component.vue'
import Changelog from './views/changelog/component.vue'
import FeedsIndex from './views/feeds/index/component.vue'
import FeedsShow from './views/feeds/show/component.vue'
import Help from './views/help/component.vue'
import Home from './views/home/component.vue'
import IdentitiesNew from './views/identities/new/component.vue'
import IdentitiesShow from './views/identities/show/component.vue'
import ItemsShow from './views/items/show/component.vue'
import Saved from './views/saved/component.vue'
import Search from './views/search/component.vue'
import Services from './views/services/component.vue'
import Settings from './views/settings/component.vue'
import Welcome from './views/welcome/component.vue'

const routes = [
  {
    path: '/me',
    name: 'me',
    component: IdentitiesShow,
    props: true
  },
  {
    path: '/about',
    name: 'about',
    component: About,
    props: true
  },
  {
    path: '/splash',
    name: 'splash',
    component: Welcome,
    props: true
  },
  {
    path: '/search',
    name: 'search',
    component: Search,
    props: true
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
    props: true
  },
  {
    path: '/feeds',
    name: 'feeds',
    component: FeedsIndex,
    props: true
  },
  {
    path: '/saved',
    name: 'saved',
    component: Saved,
    props: true
  },
  {
    path: '/changelog',
    name: 'Changelog',
    component: Changelog,
    props: true
  },
  {
    path: '/identities/new',
    name: 'identities/new',
    component: IdentitiesNew,
    props: true
  },
  {
    path: '/feeds/:feed_url',
    name: 'feed',
    component: FeedsShow,
    props: true
  },
  {
    path: '/feeds/:feed_url/:guid',
    name: 'item',
    component: ItemsShow,
    props: true
  },
  {
    path: '/help',
    name: 'help',
    component: Help,
    props: true
  },
  {
    path: '/services',
    name: 'services',
    component: Services,
    props: true
  },
  {
    path: '/:media_verb',
    name: 'media_verb_home',
    component: Home,
    props: true
  },
  {
    path: '/',
    name: 'home',
    component: Home,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior () {
    return { top: 0, behavior: 'smooth' }
  },
  routes
})

export default router

export {
  routes
}
