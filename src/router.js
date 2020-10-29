import { createRouter, createWebHistory } from 'vue-router'
import About from './components/about/component.vue'
import Create from './components/create/component.vue'
import Discover from './components/discover/component.vue'
import Feed from './components/feed/component.vue'
import Help from './components/help/component.vue'
import Home from './components/home/component.vue'
import Item from './components/item/component.vue'
import Me from './components/me/component.vue'
import Messages from './components/messages/component.vue'
import IdentitiesNew from './components/identities/new/component.vue'
import Saved from './components/saved/component.vue'
import Search from './components/search/component.vue'
import Services from './components/services/component.vue'
import Settings from './components/settings/component.vue'
import Splash from './components/splash/component.vue'
import Subscriptions from './components/subscriptions/component.vue'
import Changelog from './components/changelog/component.vue'

const routes = [
  {
    path: '/me',
    name: 'me',
    component: Me,
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
    component: Splash,
    props: true
  },
  {
    path: '/messages',
    name: 'messages',
    component: Messages,
    props: true
  },
  {
    path: '/discover',
    name: 'discover',
    component: Discover,
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
    component: Subscriptions,
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
    component: Feed,
    props: true
  },
  {
    path: '/feeds/:feed_url/:guid',
    name: 'item',
    component: Item,
    props: true
  },
  {
    path: '/create',
    name: 'create',
    component: Create,
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
