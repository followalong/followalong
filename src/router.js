import { createRouter, createWebHistory } from 'vue-router'
import About from './pages/about/component.vue'
import Changelog from './pages/changelog/component.vue'
import FeedsIndex from './pages/feeds/index/component.vue'
import FeedsShow from './pages/feeds/show/component.vue'
import Help from './pages/help/component.vue'
import Home from './pages/home/component.vue'
import IdentitiesNew from './pages/identities/new/component.vue'
import IdentitiesShow from './pages/identities/show/component.vue'
import ItemsShow from './pages/items/show/component.vue'
import Saved from './pages/saved/component.vue'
import Search from './pages/search/component.vue'
import Services from './pages/services/component.vue'
import Settings from './pages/settings/component.vue'
import Welcome from './pages/welcome/component.vue'

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
    path: '/subscriptions',
    name: 'subscriptions',
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
