<template>
  <div id="app">
    <TopBar :app="app" />

    <div class="container">
      <div class="content">
        <div v-if="identity">
          <Sidebar :app="app" />
          <MediaPlayer
            v-if="playing"
            :app="app"
            :item="playing"
          />
          <router-view :app="app" />
        </div>
        <div v-else>
          <div class="sidebar" />
          <p>Securely loading your data...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import utils from '@/lib/utils/index.js'
import localStore from '@/lib/local-store.js'
import MediaPlayer from '@/components/media-player/component.vue'
import Sidebar from '@/components/sidebar/component.vue'
import TopBar from '@/components/top-bar/component.vue'
import keychain from '@/lib/keychain'
import Commands from '@/lib/commands.js'
import State from '@/lib/state.js'
import Queries from '@/lib/queries.js'

export default {
  components: {
    MediaPlayer,
    Sidebar,
    TopBar
  },
  data () {
    window.followAlong = this
    const state = new State({ identities: [], feeds: [], items: [] })
    const queries = new Queries(state)
    const commands = new Commands(state, queries, localStore)

    return {
      app: this,
      queries,
      commands,
      keychain,
      identity: null,
      sidebarClass: '',
      now: new Date(),
      playing: undefined
    }
  },
  mounted () {
    if (process.env.NODE_ENV !== 'development') {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
        })
      }
    }

    return this.restoreIdentities()
  },
  methods: {
    restoreIdentities () {
      return this.app.commands.restoreLocal().then((identities) => {
        this.setIdentity(this.queries.findDefaultIdentity())
      })
    },

    setIdentity (identity) {
      this.identity = identity
      // this.commands.fetchAllFeeds(identity)
    },

    toggleSidebar (forceHide) {
      var _ = this

      if (forceHide || _.app.sidebarClass === 'show') {
        _.app.sidebarClass = ''
        document.body.style.overflow = ''
      } else {
        _.app.sidebarClass = 'show'
        document.body.style.overflow = 'hidden'
      }
    },

    blankifyLinks (str) {
      return utils.stripScriptsAndStyles(
        (str || '')
          .replace(/target=['"]?[^"']+['"\s>]?/g, '')
          .replace(/<a([^>]+)>?/g, '<a$1 target="_blank">')
      )
    },

    prettyDate (date) {
      return utils.timeAgo(new Date(date), new Date())
    },

    play (item) {
      this.playing = item
    },

    stop () {
      this.playing = null
    }
  }
}
</script>

<style lang="scss">
@import "./index.scss";
</style>
