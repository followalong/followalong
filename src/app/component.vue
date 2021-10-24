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
import LocalCacheAdapter from '@/adapters/local-cache.js'
import MediaPlayer from '@/app/components/media-player/component.vue'
import Sidebar from '@/app/components/sidebar/component.vue'
import TopBar from '@/app/components/top-bar/component.vue'
import keychain from '@/adapters/keychain.js'
import Commands from '@/commands/index.js'
import State from '@/state/index.js'
import Queries from '@/queries/index.js'
import copyToClipboard from 'copy-to-clipboard'
import { saveAs } from 'file-saver'

export default {
  components: {
    MediaPlayer,
    Sidebar,
    TopBar
  },
  props: {
    localCacheAdapter: {
      type: Object,
      default: () => new LocalCacheAdapter()
    },
    state: {
      type: Object,
      default: () => new State({ identities: [], feeds: [], items: [] })
    }
  },
  data () {
    window.followAlong = this
    const queries = new Queries({
      state: this.state,
      localCacheAdapter: this.localCacheAdapter
    })
    const commands = new Commands({
      state: this.state,
      queries,
      localCacheAdapter: this.localCacheAdapter,
      copyToClipboard,
      saveAs
    })

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
      return this.app.commands.restoreLocal().then(() => {
        this.setIdentity(this.queries.findDefaultIdentity())
      })
    },

    setIdentity (identity) {
      this.identity = identity
      this.app.commands.fetchNextFeedPerpetually(identity)
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