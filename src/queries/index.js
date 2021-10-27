import LocalServiceAdapter from '@/adapters/services/local.js'
import FollowAlongFreeServiceAdapter from '@/adapters/services/followalong-free.js'
import sortByReadAndDate from './sorters/sort-by-read-and-date.js'
import sortByName from './sorters/sort-by-name.js'
import sortByLastUpdated from './sorters/sort-by-last-updated.js'
import { getAudioSrc, getVideoSrc, getImageSrc } from './helpers/get-src.js'
import prepareContent from './helpers/prepare-content.js'
import timeAgo from './helpers/time-ago.js'
import { encrypt, decrypt } from './helpers/crypt.js'

const WORD_LIMIT = 125

class Queries {
  constructor (options) {
    for (const key in options) {
      this[key] = options[key]
    }
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

    return this.state.findAll('items', (i) => i.feedUrl === feed.url).sort(sortByReadAndDate())
  }

  findIdentity (id) {
    return this.state.find('identities', id)
  }

  identityForFeed (feed) {
    if (!feed) {
      return
    }

    return this.state.find('identities', (i) => i.id === feed.identityId)
  }

  serviceForIdentity (identity, type) {
    identity.services = identity.services || {}
    identity.services[type] = identity.services[type] || {}

    if (type === 'local') {
      return new LocalServiceAdapter(this.serviceAdapterOptions, identity.services[type])
    } else {
      return new FollowAlongFreeServiceAdapter(this.serviceAdapterOptions, identity.services[type])
    }
  }

  feedsForIdentity (identity) {
    return this.state.findAll('feeds', (f) => f.identityId === identity.id).sort(sortByName)
  }

  itemsForIdentity (identity) {
    return this.feedsForIdentity(identity)
      .reduce((items, f) => items.concat(this.itemsForFeed(f)), [])
      .sort(sortByReadAndDate())
  }

  hintIsShown (identity, hint) {
    return (identity.hints || []).indexOf(hint) === -1
  }

  findDefaultIdentity () {
    return this.state.findAll('identities')[0]
  }

  unreadItems (feed) {
    return this.itemsForFeed(feed).filter((item) => this.isUnread(item))
  }

  findFeedByUrl (url) {
    return this.state.find('feeds', (f) => f.url === url)
  }

  allIdentities () {
    return this.state.findAll('identities')
  }

  allFeeds () {
    return this.state.findAll('feeds')
  }

  findMostOutdatedNonPausedFeed (identity) {
    return this.feedsForIdentity(identity)
      .filter(this.isNotPaused)
      .sort(sortByLastUpdated)[0]
  }

  identityToLocal (identity) {
    return {
      id: identity.id,
      name: identity.name,
      hints: identity.hints,
      feeds: this.feedsForIdentity(identity),
      items: this.itemsForIdentity(identity),
      services: identity.services
    }
  }

  getLocalDecryptionFunction (id) {
    return new Promise((resolve, reject) => {
      return this.getLocalEncryptionKey(id)
        .then((key) => resolve(decrypt(key)))
        .catch(reject)
    })
  }

  getLocalEncryptionFunction (id) {
    return new Promise((resolve, reject) => {
      return this.getLocalEncryptionKey(id)
        .then((key) => resolve(encrypt(key)))
        .catch(reject)
    })
  }

  getLocalEncryptionKey (id) {
    return new Promise((resolve, reject) => {
      this.keychainAdapter.getKey(id)
        .then(resolve)
        .catch(reject)
    })
  }

  localSize (identity) {
    return new Promise((resolve, reject) => {
      this.getLocalEncryptionFunction(identity.id)
        .then((func) => {
          let data = func(this.identityToLocal(identity))

          if (typeof data === 'object') {
            data = JSON.stringify(data)
          }

          resolve(this._getSize(data))
        })
        .catch(reject)
    })
  }

  remoteSize () {
    return '0 kb'
  }

  // TODO: Are these presenters?

  itemContent (item) {
    return prepareContent(item.content || '')
  }

  itemShortContent (item) {
    const words = (item.content || '').split(/\s+/)
    const content = `${words.slice(0, WORD_LIMIT).join(' ').trim()}...`

    return `${prepareContent(content)}...`
  }

  prettyPublishedDate (item) {
    return timeAgo(new Date(item.pubDate), new Date())
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

  isNotRead (item) {
    if (!item) {
      return false
    }

    return !item.readAt
  }

  isUnread (item) {
    if (!item) {
      return false
    }

    return !item.readAt
  }

  isListenable (item) {
    return getAudioSrc(item)
  }

  isWatchable (item) {
    return getVideoSrc(item)
  }

  isReadable (item) {
    return !getVideoSrc(item) && !getAudioSrc(item)
  }

  hasMedia (item) {
    return getVideoSrc(item) || getAudioSrc(item) || getImageSrc(item)
  }

  hasImage (item) {
    return getImageSrc(item)
  }

  hasChangeablePassword (service) {
    return service.encryptionStrategy === 'ask' || service.encryptionStrategy === 'store'
  }

  _getSize (data) {
    let size = data.length
    let unit = 'b'

    if (size > 1000000) {
      size = size / 1000000
      unit = 'mb'
    } else if (size > 1000) {
      size = size / 1000
      unit = 'kb'
    }

    return '~' + (Math.round(size * 10) / 10) + ' ' + unit
  }
}

export default Queries
