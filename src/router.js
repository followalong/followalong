import Vue            from 'vue';
import Router         from 'vue-router';
import Home           from './views/Home.vue';
import Me             from './views/Me.vue';
import About          from './views/About.vue';
import Messages       from './views/Messages.vue';
import Discover       from './views/Discover.vue';
import Search         from './views/Search.vue';
import Settings       from './views/Settings.vue';
import Feed           from './views/Feed.vue';
import Subscriptions  from './views/Subscriptions.vue';
import Saved          from './views/Saved.vue';
import Item           from './views/Item.vue';
import NewIdentity    from './views/Identities-New.vue';
import Updates        from './views/Updates.vue';
import Create          from './views/Create.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
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
      path: '/updates',
      name: 'updates',
      component: Updates,
      props: true
    },
    {
      path: '/identities/new',
      name: 'identities/new',
      component: NewIdentity,
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
})
