<template>
  <div id="app">
    <TopBar :app="app" />

    <div class="content">
      <div v-if="identity">
        <Sidebar :app="app" />
        <router-view :app="app" />
      </div>
      <div v-else>
        <div class="sidebar" />
        <p>Securely loading your data...</p>
      </div>
    </div>

    <MediaPlayer
      v-if="playing"
      :app="app"
      :playing="playing"
    />

    <Membership
      :app="app"
      :membership="membership"
    />
  </div>
</template>

<script>
import localForage from 'localforage'
import MediaPlayer from '@/components/media-player/component.vue'
import Membership from '@/components/membership/component.vue'
import methods from '@/components/app/methods'
import Sidebar from '@/components/sidebar/component.vue'
import sorter from '@/components/app/sorter'
import TopBar from '@/components/top-bar/component.vue'

export default {
  components: {
    MediaPlayer,
    Membership,
    Sidebar,
    TopBar
  },
  data: function () {
    var _ = this

    window.app = _

    return {
      app: _,
      store: localForage.createInstance({
        name: 'commmunity'
      }),
      membership: {
        feed: undefined,
        intent: undefined
      },
      loading: true,
      identities: [],
      keychain: {},
      identity: null,
      sidebarClass: '',
      hints: [],
      now: new Date(),
      playing: undefined
    }
  },
  computed: {
    nonIdentities () {
      return this.app.identities.filter((i) => {
        return i.id !== this.identity.id
      })
    },
    newsfeed () {
      if (!this.identity) return []

      return (this.identity.items || []).filter((item) => {
        this.setMediaVerb(item)
        return true
      }).sort(sorter(this.identity))
    },
    saved () {
      return this.newsfeed.filter(function (item) {
        return !!item.isSaved
      })
    },
    unread () {
      return this.newsfeed.filter(function (item) {
        return !item.isRead
      })
    }
  },
  mounted () {
    this.setupApp(this)

    if (process.env.NODE_ENV !== 'development') {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
        })
      }
    }
  },
  methods
}
</script>

<style lang="scss">
@import "./index.scss";
</style>
