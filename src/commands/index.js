import seedIdentity from './seed.js'
import { getFeed } from './fetcher'
import { Base64 } from 'js-base64'

let timer = null
let resolves = []

const uniq = (value, index, arr) => {
  return arr.indexOf(value) === index
}

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
    this.debouncedSave(identity)

    return Promise.resolve()
  }

  catchMeUp (identity, items) {
    items
      .filter((item) => this.queries.isUnread(item))
      .forEach((item) => this.toggleRead(identity, item, true))
  }

  hideHint (identity, hint) {
    identity.hints = identity.hints || []

    if (identity.hints.indexOf(hint) === -1) {
      identity.hints.push(hint)
    }

    this.debouncedSave(identity)
  }

  togglePause (identity, feed, defaultValue) {
    const toBePaused = typeof defaultValue === 'undefined' ? !this.queries.isPaused(feed) : defaultValue

    if (toBePaused) {
      feed.pausedAt = Date.now()
    } else {
      delete feed.pausedAt
    }

    this.debouncedSave(identity)
  }

  toggleRead (identity, item, defaultValue) {
    const toBeRead = typeof defaultValue === 'undefined' ? !this.queries.isRead(item) : defaultValue

    if (toBeRead) {
      item.readAt = Date.now()

      const feed = this.queries.feedForItem(item)
      const pubDate = new Date(item.pubDate).getTime()

      if (feed && pubDate > (feed.latestInteractionAt || 0)) {
        feed.latestInteractionAt = pubDate
      }
    } else {
      delete item.readAt
    }

    this.debouncedSave(identity)
  }

  toggleSave (identity, item, defaultValue) {
    const toBeSaved = typeof defaultValue === 'undefined' ? !this.queries.isSaved(item) : defaultValue

    if (toBeSaved) {
      item.savedAt = Date.now()
    } else {
      delete item.savedAt
    }

    this.debouncedSave(identity)
  }

  fetchAllFeeds (identity, auto) {
    if (this.noAutomaticFetches && auto) {
      return
    }

    const feeds = this.queries
      .feedsForIdentity(identity)
      .filter(this.queries.isNotPaused)

    return this._fetchFeedsInSeries(identity, feeds)
  }

  fetchFeed (identity, feed, isNew = false) {
    const addon = this.queries.addonForIdentity(identity, 'rss')
    const updatedAt = Date.now()

    feed.fetchingAt = updatedAt

    return new Promise((resolve, reject) => {
      getFeed(identity, addon, feed, updatedAt)
        .then((data) => {
          feed.name = data.title || data.name || feed.name
          feed.description = feed.description || data.description

          const items = (data.items || []).map(this._parseRawFeedItem)

          this.addItemsForFeed(identity, feed, items, isNew)
        })
        .finally(() => {
          feed.updatedAt = updatedAt
          delete feed.fetchingAt
          this.debouncedSave(identity)
          resolve()
        })
    })
  }

  addFeedToIdentity (identity, feed) {
    feed.identityId = identity.id

    this.debouncedSave(identity)

    return feed
  }

  addItemToFeed (feed, item) {
    item.feedUrl = feed.url
  }

  copyConfig (identity) {
    const data = this.queries.identityToRemote(identity)
    this.copyToClipboard(Base64.encode(JSON.stringify(data)))
    alert('Copied configuration to clipboard.')
  }

  downloadIdentity (identity) {
    const data = this.queries.identityToRemote(identity)
    const filename = window.location.host.replace(':', '.') + '.' + identity.id + '.json'
    const str = JSON.stringify(data)
    const blob = new Blob([str], { type: 'application/json;charset=utf-8' })

    this.saveAs(blob, filename)
  }

  removeIdentity (identity) {
    this.state.removeAll('identities', [identity])
    this.state.removeAll('feeds', this.queries.feedsForIdentity(identity))
    this.state.removeAll('items', this.queries.itemsForIdentity(identity))

    return this.removeLocal(identity)
  }

  addIdentity (data, feeds, items) {
    const identity = this.state.add('identities', [data])[0]

    this.state.add('feeds', feeds || [], (f) => this.addFeedToIdentity(identity, f))
    this.state.add('items', items || [])
    this.applyRemoteIdentity(identity)
    this.debouncedSave(identity)
  }

  getLocalIdentity (id) {
    return new Promise((resolve, reject) => {
      this.queries.getLocalDecryptionFunction(id).then((func) => {
        const identity = { id }
        const addon = this.queries.addonForIdentity(identity, 'local')

        addon.get(identity, func)
          .then(resolve)
          .catch(reject)
      }).catch(reject)
    })
  }

  applyRemoteIdentity (identity) {
    return new Promise((resolve, reject) => {
      this.getRemoteIdentity(identity).then((remoteData) => {
        if (!remoteData) {
          return resolve()
        }

        if (remoteData.name) {
          identity.name = remoteData.name
        }

        if (remoteData.hints) {
          identity.hints = (identity.hints || []).concat(remoteData.hints || []).filter(uniq)
        }

        if (remoteData.feeds) {
          (remoteData.feeds || []).forEach((remoteFeed) => {
            const found = this.queries.findFeedByUrl(remoteFeed.url)

            if (found) {
              if ((remoteFeed.updatedAt || 0) > (found.updatedAt || 0)) {
                for (const key in remoteFeed) {
                  found[key] = remoteFeed[key]
                }
              }
            } else {
              const newFeed = this.addFeed(remoteFeed)
              this.addFeedToIdentity(identity, newFeed)
            }
          })
        }

        if (remoteData.items) {
          (remoteData.items || []).forEach((remoteItem) => {
            const found = this.queries.findItemById(remoteItem.guid)

            if (found) {
              for (const key in remoteItem) {
                found[key] = remoteItem[key]
              }
            } else {
              this.state.add('items', [remoteItem])
            }
          })
        }

        resolve()
      }).catch(reject)
    })
  }

  getRemoteIdentity (identity) {
    return new Promise((resolve, reject) => {
      this.queries.getLocalDecryptionFunction(identity.id).then((func) => {
        const addon = this.queries.addonForIdentity(identity, 'sync')

        addon.get(identity, func)
          .then(resolve)
          .catch(reject)
      }).catch(reject)
    })
  }

  restoreLocal () {
    return new Promise((resolve, reject) => {
      this.keychainAdapter.getKeys().then((ids) => {
        const promises = ids.map((id) => {
          return this.getLocalIdentity(id)
            .then((data) => {
              this.addIdentity(data, data.feeds, data.items)
            })
            .catch(() => {
              // We're here.
              if (confirm('Something went wrong. Try again?')) {
                this.reload()
              }
            })
        })

        Promise.all(promises).finally(() => {
          if (!this.queries.allIdentities().length) {
            this.addIdentity({ name: seedIdentity.name, addons: seedIdentity.addons }, [].concat(seedIdentity.feeds))
            const identity = this.queries.findDefaultIdentity()
            this.fetchAllFeeds(identity, true)
            this.keychainAdapter.addNone(identity.id)
          }

          resolve()
        })
      }).catch(reject)
    })
  }

  saveLocal (identity) {
    this.queries.getLocalEncryptionFunction(identity.id)
      .then((func) => {
        const addon = this.queries.addonForIdentity(identity, 'local')

        addon.save(
          this.queries.identityToLocal(identity),
          func
        )
      })
  }

  debouncedSave (identity) {
    debouncedPromise(() => this.save(identity), 1500, this)
  }

  save (identity) {
    this.saveLocal(identity)
    this.saveRemote(identity)
  }

  saveRemote (identity) {
    this.queries.getLocalEncryptionFunction(identity.id)
      .then((func) => {
        const addon = this.queries.addonForIdentity(identity, 'sync')

        this.applyRemoteIdentity(identity).then(() => {
          addon.save(
            this.queries.identityToRemote(identity),
            func
          )
        })
      })
  }

  removeLocal (identity) {
    const addon = this.queries.addonForIdentity(identity, 'local')

    return new Promise((resolve, reject) => {
      this.keychainAdapter.remove(identity.id)
        .then(() => {
          addon.remove(identity.id)
            .then(resolve)
            .catch(reject)
        })
        .catch(reject)
    })
  }

  reload () {
    window.location.href = '/'
  }

  addFeed (feed) {
    return this.state.add('feeds', [feed])[0]
  }

  fetchNextFeedPerpetually (identity) {
    if (this.noAutomaticFetches) {
      return
    }

    const POLL = 10000
    const feeds = this.queries.findOutdatedFeeds(identity)

    this._fetchFeedsInSeries(identity, feeds, true).then(() => {
      setTimeout(() => this.fetchNextFeedPerpetually(identity), POLL)
    })
  }

  changeLocalEncryptionStrategy (identity, encryptionStrategy) {
    const addon = this.queries.addonForIdentity(identity, 'local')

    return this.keychainAdapter.add(encryptionStrategy, identity.id).then(() => {
      addon.data.encryptionStrategy = encryptionStrategy
      this.debouncedSave(identity)
    })
  }

  changeMaxReadLimit (identity, maxReadLimit) {
    const addon = this.queries.addonForIdentity(identity, 'local')

    addon.data.maxReadLimit = Math.max(0, parseInt(maxReadLimit || 150))

    this.debouncedSave(identity)
  }

  showNewItems (identity) {
    this.resetNewItemsCount(identity)
    this.scrollToTop()

    this.queries.itemsForIdentity(identity)
      .filter((item) => this.queries.isNew(item))
      .forEach((item) => this._showNewItem(item))
  }

  scrollToTop () {
    this.window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }

  _showNewItem (item) {
    item.isNew = false
  }

  _hideNewItem (item) {
    item.isNew = true
  }

  _fetchFeedsInSeries (identity, feeds, isNew = false) {
    let promise = Promise.resolve()

    if (!feeds.length) {
      return promise
    }

    feeds.forEach((feed) => {
      promise = promise.then(() => {
        return new Promise((resolve) => {
          this.fetchFeed(identity, feed, isNew)
            .finally(() => setTimeout(resolve, 0))
        })
      })
    })

    return promise
  }

  addItemsForFeed (identity, feed, items, isNew = false) {
    const feedItems = this.queries.itemsForFeed(feed)
    const latestInteractionAt = new Date(feed.latestInteractionAt).getTime()
    const newItems = items.filter((item) => {
      const existingItem = feedItems.find((existingItem) => existingItem.guid === item.guid || existingItem.guid === item.id)

      if (existingItem) {
        for (const key in item) {
          existingItem[key] = item[key]
        }

        return !existingItem
      }

      if (new Date(item.pubDate).getTime() <= latestInteractionAt) {
        item.readAt = latestInteractionAt
      } else if (isNew) {
        this._hideNewItem(item)
      }

      return true
    })
    const unreadNewItemsLength = newItems.filter(this.queries.isNew).length

    if (unreadNewItemsLength) {
      this.incrementNewItemsCount(identity, unreadNewItemsLength)
    }

    this.state.add('items', newItems, (item) => this.addItemToFeed(feed, item))
  }

  incrementNewItemsCount (identity, newItemsCount) {
    identity.newItemsCount = (identity.newItemsCount || 0) + newItemsCount
  }

  resetNewItemsCount (identity) {
    identity.newItemsCount = 0
  }

  importConfiguration (configuration) {
    return new Promise((resolve, reject) => {
      configuration = configuration.trim()

      try {
        configuration = JSON.parse(Base64.decode(configuration))
      } catch (e) {
        return reject(new Error('Invalid configuration.'))
      }

      const existingIdentity = this.queries.findIdentity(configuration.id)

      if (existingIdentity) {
        return reject(new Error('An identity with this ID already exists. Please remove it first.'))
      }

      const feeds = configuration.feeds || []
      delete configuration.feeds

      const items = configuration.items || []
      delete configuration.items

      this.addIdentity(configuration, feeds, items)
      this.keychainAdapter.addNone(configuration.id)

      const identities = this.queries.allIdentities()
      const identity = identities[identities.length - 1]

      resolve(identity)
    })
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
