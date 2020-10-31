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
import changelog from '@/../changelog.json'
import localForage from 'localforage'
import MediaPlayer from '@/components/media-player/component.vue'
import Membership from '@/components/membership/component.vue'
import methods from '@/components/app/methods'
import Sidebar from '@/components/sidebar/component.vue'
import sorter from '@/components/app/sorter'
import TopBar from '@/components/top-bar/component.vue'

function SORT_BY_NAME (a, b) {
  if (a.name < b.name) return -1
  if (a.name > b.name) return 1
  return 0
}

export default {
  components: {
    MediaPlayer,
    Membership,
    Sidebar,
    TopBar
  },
  data: function () {
    var _ = this

    if (process.env.NODE_ENV === 'development') {
      window.app = _
    }

    return {
      app: _,
      api: false,
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
      playing: undefined,
      changelog: changelog,
      version: Object.keys(changelog)[0]
    }
  },
  computed: {
    nonIdentities () {
      var _ = this

      return _.app.identities.filter(function (i) {
        return i.id !== _.identity.id
      })
    },
    newsfeed () {
      var _ = this

      if (!_.identity) return []

      return (_.identity.items || []).filter(function (item) {
        _.setMediaVerb(item)
        return true
      }).sort(sorter(_.identity))
    },
    saved () {
      var _ = this

      return _.newsfeed.filter(function (item) {
        return !!item.isSaved
      }).sort(sorter(_.identity))
    },
    unread () {
      var _ = this

      return _.newsfeed.filter(function (item) {
        return !item.isRead
      }).sort(sorter(_.identity))
    },
    unreadWatches () {
      var _ = this

      return _.unread.filter(function (item) {
        return item._mediaVerb === 'watch'
      })
    },
    unreadListens () {
      var _ = this

      return _.unread.filter(function (item) {
        return item._mediaVerb === 'listen'
      })
    },
    unreadReads () {
      var _ = this

      return _.unread.filter(function (item) {
        return item._mediaVerb === 'read'
      })
    },
    feeds () {
      var _ = this

      if (!_.identity) return []
      return (_.identity.feeds || []).sort(SORT_BY_NAME)
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
