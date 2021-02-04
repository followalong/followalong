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
import createModels from '@/models/index.js'
import PopoutPlayer from '@/components/popout-player/component.vue'
import methods from '@/components/app/methods'
import Sidebar from '@/components/sidebar/component.vue'
import TopBar from '@/components/top-bar/component.vue'
import store from '@/store'
import keychain from '@/keychain'

export default {
  components: {
    PopoutPlayer,
    Sidebar,
    TopBar
  },
  data: function () {
    const models = createModels()

    window.followAlong = this

    return {
      app: this,
      store: store,
      models: models,
      identities: models.identity.data,
      keychain: keychain,
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
    if (process.env.NODE_ENV !== 'development') {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
        })
      }
    }

    return this.setupApp(this)
  },
  methods
}
</script>

<style lang="scss">
@import "./index.scss";
</style>
