import seedIdentity from './seed.js'
import { getFeed } from './fetcher'
import { Base64 } from 'js-base64'

let timer = null
let resolves = []

const debouncedPromise = (func, timeout = 0, thisArg) => {
  clearTimeout(timer)

  timer = setTimeout(() => {
    const result = func.call(thisArg)
    resolves.forEach(r => r(result))
    resolves = []
  }, timeout)

  return new Promise(resolve => resolves.push(resolve))
}

class Commands {
  constructor (options) {
    for (const key in options) {
      this[key] = options[key]
    }
  }

  unsubscribeFeed (identity, feed) {
    if (!window.confirm('Are you sure you want to remove this feed?')) {
      return
    }

    this.state.removeAll('items', this.queries.itemsForFeed(feed))
    this.state.removeAll('feeds', [feed])
    this.saveLocal(identity)
  }

  catchMeUp (identity, items) {
    items
      .filter((item) => this.queries.isUnread(item))
      .forEach((item) => this.toggleRead(identity, item, true))

    this.saveLocal(identity)
  }

  hideHint (identity, hint) {
    identity.hints = identity.hints || []

    if (identity.hints.indexOf(hint) === -1) {
      identity.hints.push(hint)
    }

    this.saveLocal(identity)
  }

  togglePause (identity, feed, defaultValue) {
    const toBePaused = typeof defaultValue === 'undefined' ? !this.queries.isPaused(feed) : defaultValue

    if (toBePaused) {
      feed.pausedAt = Date.now()
    } else {
      delete feed.pausedAt
    }

    this.saveLocal(identity)
  }

  toggleRead (identity, item, defaultValue) {
    const toBeRead = typeof defaultValue === 'undefined' ? !this.queries.isRead(item) : defaultValue

    if (toBeRead) {
      item.readAt = Date.now()
    } else {
      delete item.readAt
    }

    this.saveLocal(identity)
  }

  toggleSave (identity, item, defaultValue) {
    const toBeSaved = typeof defaultValue === 'undefined' ? !this.queries.isSaved(item) : defaultValue

    if (toBeSaved) {
      item.savedAt = Date.now()
    } else {
      delete item.savedAt
    }

    this.saveLocal(identity)
  }

  fetchAllFeeds (identity) {
    const promises = this.queries
      .feedsForIdentity(identity)
      .filter(this.queries.isNotPaused)
      .map((feed) => this.fetchFeed(identity, feed))

    return Promise.all(promises)
  }

  fetchFeed (identity, feed) {
    const service = this.queries.serviceForIdentity(identity, 'rss')
    const updatedAt = Date.now()

    feed.fetchingAt = updatedAt

    return new Promise((resolve, reject) => {
      getFeed(identity, service, feed, updatedAt)
        .then((data) => {
          feed.name = data.title || data.name || feed.name
          feed.description = feed.description || data.description
          feed.updatedAt = updatedAt

          const items = (data.items || []).map(this._parseRawFeedItem)

          this._addItemsForFeed(feed, items)
        })
        .catch(reject)
        .finally(() => {
          delete feed.fetchingAt
          this.saveLocal(identity)
          resolve()
        })
    })
  }

  addFeedToIdentity (identity, feed) {
    feed.identityId = identity.id

    this.saveLocal(identity)

    return feed
  }

  addItemToFeed (feed, item) {
    item.feedUrl = feed.url
  }

  copyConfig (identity) {
    const data = 'this.presenters.identityToRemote(identity)'
    this.copyToClipboard(Base64.encode(JSON.stringify(data)))
    alert('Copied configuration to clipboard.')
  }

  downloadIdentity (identity) {
    const data = 'this.presenters.identityToRemote(identity)'
    const filename = window.location.host.replace(':', '.') + '.' + identity.id + '.json'
    const str = JSON.stringify(data)
    const blob = new Blob([str], { type: 'application/json;charset=utf-8' })

    this.saveAs(blob, filename)
  }

  removeIdentity (identity) {
    this.state.removeAll('identities', [identity])
    this.state.removeAll('feeds', this.queries.feedsForIdentity(identity))
    this.state.removeAll('items', this.queries.itemsForIdentity(identity))
    this.removeLocal(identity)
  }

  addIdentity (data, feeds, items) {
    const identity = this.state.add('identities', [data])[0]

    this.state.add('feeds', feeds || [], (f) => this.addFeedToIdentity(identity, f))
    this.state.add('items', items || [])
    this.saveLocal(identity)
  }

  getLocalIdentity (id) {
    return this.localCacheAdapter.getIdentity(id)
  }

  restoreLocal (identity) {
    return new Promise((resolve) => {
      this.localCacheAdapter.getIdentityIds().then((ids) => {
        const promises = ids.map((id) => {
          return this.getLocalIdentity(id)
            .then((data) => this.addIdentity(data, data.feeds, data.items))
        })

        Promise.all(promises).finally(() => {
          if (!this.queries.allIdentities().length) {
            this.addIdentity({ name: seedIdentity.name }, [].concat(seedIdentity.feeds))
          }

          resolve()
        })
      })
    })
  }

  saveLocal (identity, data) {
    return debouncedPromise(() => {
      return this.localCacheAdapter.saveIdentity(this.queries.identityToLocal(identity))
    }, 300, this)
  }

  removeLocal (identity) {
    return this.localCacheAdapter.removeIdentity(identity.id)
  }

  reload () {
    window.location.href = '/'
  }

  addFeed (feed) {
    return this.state.add('feeds', [feed])[0]
  }

  fetchNextFeedPerpetually (identity) {
    const DELAY_BETWEEN_FETCHES = 30000
    const feed = this.queries.findMostOutdatedNonPausedFeed(identity)
    const done = () => setTimeout(() => this.fetchNextFeedPerpetually(identity), DELAY_BETWEEN_FETCHES)

    if (!feed) return done()

    return this.fetchFeed(identity, feed).then(done)
  }

  changeLocalEncryptionStrategy (identity, strategy) {
    this.queries.serviceForIdentity(identity, 'local').strategy = strategy
    this.saveLocal(identity)
  }

  _addItemsForFeed (feed, items) {
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

    this.state.add('items', newItems, (item) => this.addItemToFeed(feed, item))
  }

  _parseRawFeedItem (item) {
    item.guid = item.guid || item.id

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

export default Commands
