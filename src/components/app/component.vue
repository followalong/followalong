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
import generateId from '@/components/app/utils/generate-id.js'
import sorter from '@/components/app/sorter'
import { getFeed } from '@/components/app/fetcher'
import SERVICES from '@/components/app/services'

class State {
  constructor (data) {
    this.data = data
  }

  findAll (model, where) {
    let instances = this.data[model]

    if (where) {
      instances = instances.filter(where)
    }

    return instances
  }

  find (model, where) {
    return this.findAll(model, where)[0]
  }

  add (model, data, applyToEach) {
    const instances = data.map((instance) => {
      const i = Object.assign({}, instance)

      i.id = i.id || generateId()

      if (typeof applyToEach === 'function') {
        applyToEach(i)
      }

      return i
    })

    this.data[model].push.apply(this.data[model], instances)

    return instances
  }

  removeAll (model, instances) {
    instances.forEach((instance) => {
      const index = this.data[model].indexOf(instance)

      this.data[model].splice(index, 1)
    })
  }
}

class Queries {
  constructor (state) {
    this.state = state
  }

  feedForItem (item) {
    if (!item) {
      return
    }

    return this.state.find('feeds', (f) => f.url === item.feedUrl)
  }

  itemsForFeed (feed) {
    if (!feed) {
      return
    }

    return this.state.findAll('items', (i) => i.feedUrl === feed.url).sort(sorter())
  }

  identityForFeed (feed) {
    if (!feed) {
      return
    }

    return this.state.find('identities', (i) => i.id === feed.identityId)
  }

  isPaused (feed) {
    if (!feed) {
      return false
    }

    return !!feed.pausedAt
  }

  isNotPaused (feed) {
    if (!feed) {
      return false
    }

    return !feed.pausedAt
  }

  isFetching (feed) {
    if (!feed) {
      return false
    }

    return !!feed.fetchingAt
  }

  isSaved (item) {
    if (!item) {
      return false
    }

    return !!item.savedAt
  }

  isRead (item) {
    if (!item) {
      return false
    }

    return !!item.readAt
  }

  isUnread (item) {
    if (!item) {
      return false
    }

    return !item.readAt
  }

  isListenable (item) {
    return utils.getAudioSrc(item)
  }

  isWatchable (item) {
    return utils.getVideoSrc(item)
  }

  isReadable (item) {
    return !utils.getVideoSrc(item) && !utils.getAudioSrc(item)
  }

  hasMedia (item) {
    return utils.getVideoSrc(item) || utils.getAudioSrc(item)
  }

  serviceForIdentity (identity, type) {
    const services = identity.services || {}

    let service = services[type] || { symlink: 'followalong-free' }

    if (service.symlink) {
      service = SERVICES.concat(services.custom).find((s) => {
        return s.id === service.symlink
      })
    }

    const template = SERVICES.find((s) => {
      return s.id === service.template
    })

    if (template) {
      const items = ['fields', 'pricing', 'description', 'request']

      for (let i = items.length - 1; i >= 0; i--) {
        service[items[i]] = service[items[i]] || template[items[i]]
      }
    }

    return service
  }

  feedsForIdentity (identity) {
    return this.state.findAll('feeds', (f) => f.identityId === identity.id)
  }

  hintIsShown (identity, hint) {
    return (identity.hints || []).indexOf(hint) === -1
  }
}

class Commands {
  constructor (state, queries) {
    this.state = state
    this.queries = queries
  }

  unsubscribe (feed) {
    if (!confirm('Are you sure you want to remove this feed?')) {
      return
    }

    this.state.removeAll('items', this.queries.itemsForFeed(feed))
    this.state.removeAll('feeds', [feed])
  }

  catchMeUp (items) {
    items.forEach((item) => this.toggleRead(item, true))
  }

  hideHint (identity, hint) {
    identity.hints = identity.hints || []

    if (identity.hints.indexOf(hint) === -1) {
      identity.hints.push(hint)
    }
  }

  togglePause (feed, defaultValue) {
    const toBePaused = typeof defaultValue === 'undefined' ? !this.queries.isPaused(feed) : defaultValue

    if (toBePaused) {
      feed.pausedAt = Date.now()
    } else {
      delete feed.pausedAt
    }
  }

  toggleRead (item, defaultValue) {
    const toBeRead = typeof defaultValue === 'undefined' ? !this.queries.isRead(item) : defaultValue

    if (toBeRead) {
      item.readAt = Date.now()
    } else {
      delete item.readAt
    }
  }

  toggleSave (item, defaultValue) {
    const toBeSaved = typeof defaultValue === 'undefined' ? !this.queries.isSaved(item) : defaultValue

    if (toBeSaved) {
      item.savedAt = Date.now()
    } else {
      delete item.savedAt
    }
  }

  fetchAllFeeds (identity) {
    this.queries
      .feedsForIdentity(identity)
      .filter(this.queries.isNotPaused)
      .forEach((feed) => this.fetchFeed(feed))
  }

  fetchFeed (feed) {
    const identity = this.queries.identityForFeed(feed)
    const service = this.queries.serviceForIdentity(identity, 'rss')
    const updatedAt = Date.now()

    feed.fetchingAt = Date.now()

    getFeed(identity, service, feed, updatedAt)
      .then((data) => {
        feed.name = data.title || data.name || feed.name
        feed.description = feed.description || data.description
        feed.updatedAt = updatedAt

        const items = (data.items || []).map(this.parseRawFeedItem)

        this.addItemsForFeed(feed, items)
      })
      .finally(() => {
        delete feed.fetchingAt
      })
  }

  addItemsForFeed (feed, items) {
    const feedItems = this.queries.itemsForFeed(feed)
    const newItems = items.filter((item) => {
      const existingItem = feedItems.find((existingItem) => existingItem.guid === item.guid || existingItem.guid === item.id)

      if (existingItem) {
        for (const key in item) {
          existingItem[key] = item[key]
        }

        return !existingItem
      }

      return true
    })

    this.state.add('items', newItems, (i) => {
      i.feedUrl = feed.url
    })
  }

  parseRawFeedItem (item) {
    item.guid = item.guid || item.id || generateId()

    try {
      item.image = item['media:group']['media:thumbnail'][0].$
      delete item['media:group']
    } catch (e) { }

    item.pubDate = item.pubDate || item.pubdate || item.date
    item.content = item['content:encoded'] || item.content || item.summary || item.description

    if (item.content) {
      item.content = item.content.replace('<![CDATA[', '').replace(']]>', '')
    }

    return item
  }
}

export default {
  components: {
    PopoutPlayer,
    Sidebar,
    TopBar
  },
  data: function () {
    window.followAlong = this

    const state = new State({
      identities: [],
      feeds: [],
      items: []
    })
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
      return this.identityFeeds.reduce((items, f) => items.concat(this.queries.itemsForFeed(f)), [])
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
    }
  }
}
</script>

<style lang="scss">
@import "./index.scss";
</style>
