import Presenters from '@/lib/presenters.js'
import { getFeed } from '@/lib/fetcher'
import { Base64 } from 'js-base64'
import copy from 'copy-to-clipboard'
import { saveAs } from 'file-saver'

class Commands {
  constructor (state, queries, presenters) {
    this.state = state
    this.queries = queries
    this.presenters = new Presenters(queries)
  }

  unsubscribe (feed) {
    if (!window.confirm('Are you sure you want to remove this feed?')) {
      return
    }

    this.state.removeAll('items', this.queries.itemsForFeed(feed))
    this.state.removeAll('feeds', [feed])
  }

  catchMeUp (items) {
    items
      .filter((item) => this.queries.isUnread(item))
      .forEach((item) => this.toggleRead(item, true))
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
      .forEach((feed) => this.fetchFeed(feed, identity))
  }

  fetchFeed (feed, identity) {
    const service = this.queries.serviceForIdentity(identity, 'rss')
    const updatedAt = Date.now()

    feed.fetchingAt = Date.now()

    return new Promise((resolve, reject) => {
      getFeed(identity, service, feed, updatedAt)
        .then((data) => {
          feed.name = data.title || data.name || feed.name
          feed.description = feed.description || data.description
          feed.updatedAt = updatedAt

          const items = (data.items || []).map(this.parseRawFeedItem)

          this.addItemsForFeed(feed, items)
        })
        .catch(reject)
        .finally(() => {
          delete feed.fetchingAt
          resolve()
        })
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

    this.state.add('items', newItems, (item) => this.addItemToFeed(feed, item))
  }

  addItemToFeed (feed, item) {
    item.feedUrl = feed.url
  }

  parseRawFeedItem (item) {
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

  copyConfig (identity) {
    const data = this.presenters.identityToRemote(identity)
    copy(Base64.encode(JSON.stringify(data)))
    alert('Copied configuration to clipboard.')
  }

  downloadIdentity (identity) {
    const data = this.presenters.identityToRemote(identity)
    const filename = window.location.host.replace(':', '.') + '.' + identity.id + '.json'
    const str = JSON.stringify(data)
    const blob = new Blob([str], { type: 'application/json;charset=utf-8' })

    saveAs(blob, filename)
  }

  removeIdentity (identity) {
    this.state.removeAll('identities', [identity])
    this.state.removeAll('feeds', this.queries.feedsForIdentity(identity))
    this.state.removeAll('items', this.queries.itemsForIdentity(identity))
  }

  addIdentity (data, feeds) {
    const identity = this.state.add('identities', [data])[0]

    this.state.add('feeds', feeds || [], (f) => this.addFeedToIdentity(identity, f))
  }

  addFeed (feed) {
    return this.state.add('feeds', [feed])[0]
  }

  addFeedToIdentity (identity, feed) {
    feed.identityId = identity.id

    return feed
  }
}

export default Commands
