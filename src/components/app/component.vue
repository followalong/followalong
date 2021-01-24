<template>
  <div id="app">
    <TopBar :app="app" />

    <div class="content">
      <div v-if="app.identity">
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
import { reactive, computed } from 'vue'
import { Superstore } from 'vue-superstore'
import models from '@/models'
import localForage from 'localforage'
import PopoutPlayer from '@/components/popout-player/component.vue'
import methods from '@/components/app/methods'
import Sidebar from '@/components/sidebar/component.vue'
import sorter from '@/components/app/sorter'
import TopBar from '@/components/top-bar/component.vue'

export default {
  components: {
    PopoutPlayer,
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
      loading: true,
      models: new Superstore(reactive, computed, models),
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
        return i.id !== this.app.identity.id
      })
    },
    newsfeed () {
      if (!this.app.identity) return []

      return (this.app.identity.items || []).filter((item) => {
        this.setMediaVerb(item)
        return true
      }).sort(sorter(this.app.identity))
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
