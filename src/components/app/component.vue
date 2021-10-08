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

    <PopoutPlayer
      v-if="playing"
      :app="app"
      :playing="playing"
    />
  </div>
</template>

<script>
import utils from '@/components/app/utils/index.js'
import PopoutPlayer from '@/components/popout-player/component.vue'
import Sidebar from '@/components/sidebar/component.vue'
import TopBar from '@/components/top-bar/component.vue'
import keychain from '@/keychain'
import seedIdentity from '@/components/app/seed'
import Commands from '@/components/app/commands.js'
import State from '@/components/app/state.js'
import Queries from '@/components/app/queries.js'

export default {
  components: {
    PopoutPlayer,
    Sidebar,
    TopBar
  },
  data: function () {
    window.followAlong = this

    const state = new State({ identities: [], feeds: [], items: [] })
    const queries = new Queries(state)
    const commands = new Commands(state, queries)

    return {
      app: this,
      state,
      queries,
      commands,
      keychain,
      identity: null,
      sidebarClass: '',
      now: new Date(),
      playing: undefined
    }
  },
  computed: {
    identityItems () {
      return this.queries.itemsForIdentity(this.identity)
    },
    identityFeeds () {
      return this.queries.feedsForIdentity(this.identity)
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

    return this.restoreIdentities().then(() => {
      // this.commands.fetchAllFeeds(this.identity)
    })
  },
  methods: {
    restoreIdentities () {
      return new Promise((resolve, reject) => {
        this.keychain.buildIdentities().then((identities) => {
          identities.forEach((i) => this.addIdentity(i))

          if (!identities.length) {
            this.addIdentity({ name: seedIdentity.name }, seedIdentity.feeds)
          }

          this.setIdentity(this.state.findAll('identities')[0])

          resolve()
        }).catch(reject)
      })
    },

    addIdentity (data, feeds) {
      const identity = this.state.add('identities', [data])[0]
      this.addFeeds(identity, feeds)
    },

    addFeeds (identity, feeds) {
      this.state.add('feeds', feeds || [], (f) => {
        f.identityId = identity.id
      })
    },

    setIdentity (identity) {
      this.identity = identity
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
    }
  }
}
</script>

<style lang="scss">
@import "./index.scss";
</style>
