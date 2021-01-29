<template>
  <div id="app">
    <TopBar :app="app" />

    <div class="content">
      <div v-if="app.identity && app.identity._decrypted">
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
import models from '@/models/index.js'
import PopoutPlayer from '@/components/popout-player/component.vue'
import methods from '@/components/app/methods'
import Sidebar from '@/components/sidebar/component.vue'
import TopBar from '@/components/top-bar/component.vue'
import store from '@/store'

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
      store: store,
      models: models,
      identities: models.identity.data,
      keychain: {},
      identity: models.identity.data[0],
      sidebarClass: '',
      now: new Date(),
      playing: undefined
    }
  },
  computed: {
    nonIdentities () {
      return this.app.identities.filter((i) => {
        return i.id !== this.app.identity.id
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
