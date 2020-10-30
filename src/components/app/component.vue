<template>
  <div id="app">
    <MediaPlayer
      v-if="playing"
      :app="app"
      :playing="playing"
    />

    <div class="header">
      <div class="nav table">
        <ul class="table-row">
          <li class="table-cell logo">
            <a
              href="javascript:;"
              @click="$router.push('/'); app.toggleSidebar(true); fetchAllFeeds(identity, true)"
            >
              <font-awesome-icon
                v-if="loading"
                icon="spinner"
                spin
                class="loader"
              />
              <img
                v-if="!loading"
                :src="logo"
              >
              <img
                v-if="!loading"
                :src="mobileLogo"
              >
            </a>
          </li>
          <li class="table-cell search">
            <form
              method="GET"
              action="/search"
              @submit.prevent="search(q)"
            >
              <input
                v-model="q"
                type="text"
                name="q"
                autocomplete="off"
                placeholder="Search..."
              >
            </form>
          </li>
          <li
            v-if="identity && identity._decrypted"
            class="table-cell identities"
          >
            <a class="desktop-only">
              <strong>{{ identity.name }}</strong>
            </a>

            <a
              href="javascript:;"
              class="mobile-only"
              @click="app.toggleSidebar()"
            >
              <font-awesome-icon icon="bars" />
            </a>

            <ul>
              <li v-if="!nonIdentities.length">
                <router-link to="/settings">
                  Settings
                </router-link>
              </li>
              <li
                v-for="i in nonIdentities"
                :key="i.id"
              >
                <a
                  href="javascript:;"
                  @click="app.setIdentity(i);"
                >
                  <span v-if="i._decrypted">{{ i.name }}</span>
                  <span v-else>{{ i.id.slice(0, 8) }} <span class="encrypted">(not yet decrypted)</span></span>
                </a>
              </li>
              <li>
                <router-link to="/identities/new">
                  + Add Identity
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <div class="content">
      <Sidebar :app="app" />
      <div v-if="identity">
        <router-view :app="app" />
      </div>
      <div v-else>
        <p>Securely loading your data...</p>
      </div>
    </div>

    <Membership
      :app="app"
      :membership="membership"
    />
  </div>
</template>

<script>
import localForage from 'localforage'
import Sidebar from '@/components/sidebar/component.vue'
import MediaPlayer from '@/components/media-player/component.vue'
import Membership from '@/components/membership/component.vue'
import seed from '@/components/app/seed'
import sorter from '@/components/app/sorter'
import methods from '@/components/app/methods'
import changelog from '@/../changelog.json'

function SORT_BY_NAME (a, b) {
  if (a.name < b.name) return -1
  if (a.name > b.name) return 1
  return 0
}

export default {
  components: {
    Sidebar,
    MediaPlayer,
    Membership
  },
  data: function () {
    var _ = this

    if (process.env.NODE_ENV === 'development') {
      window.app = _
    }

    return {
      app: _,
      logo: '/img/logo-white.svg',
      mobileLogo: '/img/favicon-white.svg',
      q: _.$route.query.q || '',
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
      identity: {},
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
    var _ = this

    setInterval(function () {
      _.now = new Date()
    }, 60000)

    _.loading = true

    _.constructIdentities(function (identities, keychain) {
      _.keychain = keychain

      if (!identities || !identities.length) {
        identities = seed
        _.$router.push('/splash')
      }

      for (var i = identities.length - 1; i >= 0; i--) {
        _.setIdentityDefaults(identities[i])
      }

      _.identities = identities
      _.app.setIdentity(identities[0])
    })

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
