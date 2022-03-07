<template>
  <div id="app">
    <TopBar :app="app" />

    <div
      v-if="isPullable"
      class="pull-to-refresh-loader"
    >
      <font-awesome-icon
        icon="spinner"
        spin
      />
    </div>

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
import KeychainAdapter from '@/adapters/keychain.js'
import MediaPlayer from '@/app/components/media-player/component.vue'
import Sidebar from '@/app/components/sidebar/component.vue'
import TopBar from '@/app/components/top-bar/component.vue'
import Commands from '@/commands/index.js'
import State from '@/state/index.js'
import Queries from '@/queries/index.js'
import copyToClipboard from 'copy-to-clipboard'
import AWS from 'aws-sdk'
import { saveAs } from 'file-saver'

export default {
  components: {
    MediaPlayer,
    Sidebar,
    TopBar
  },
  props: {
    keychainAdapter: {
      type: Object,
      default: () => new KeychainAdapter({ prompt: window.prompt })
    },
    state: {
      type: Object,
      default: () => new State({ identities: [], feeds: [], items: [] })
    },
    window: {
      type: Object,
      default: () => window
    },
    addonAdapterOptions: {
      type: Object,
      default: () => {
        return {
          fetch: window.fetch,
          awsEndpoint (url) {
            return new AWS.Endpoint(url)
          },
          awsS3 (options) {
            return new AWS.S3(options)
          },
          awsLambda (options) {
            return new AWS.Lambda(options)
          }
        }
      }
    },
    noAutomaticFetches: {
      type: Boolean,
      default: false
    }
  },
  data () {
    window.followAlong = this
    const queries = new Queries({
      state: this.state,
      keychainAdapter: this.keychainAdapter,
      addonAdapterOptions: this.addonAdapterOptions
    })
    const commands = new Commands({
      state: this.state,
      keychainAdapter: this.keychainAdapter,
      noAutomaticFetches: this.noAutomaticFetches,
      queries,
      copyToClipboard,
      saveAs,
      window: this.window
    })

    return {
      app: this,
      queries,
      commands,
      identity: null,
      sidebarClass: '',
      now: new Date(),
      playing: undefined
    }
  },
  computed: {
    isPullable () {
      return this.$route.name === 'home'
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
