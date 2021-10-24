import SERVICES from '@/commands/services.js'
import sortByReadAndDate from './sorters/sort-by-read-and-date.js'
import sortByName from './sorters/sort-by-name.js'
import sortByLastUpdated from './sorters/sort-by-last-updated.js'
import { getAudioSrc, getVideoSrc, getImageSrc } from './helpers/get-src.js'
import prepareContent from './helpers/prepare-content.js'
import timeAgo from './helpers/time-ago.js'
import { encrypt, passThrough } from './helpers/crypt.js'

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

  identityForFeed (feed) {
    if (!feed) {
      return
    }

    return this.state.find('identities', (i) => i.id === feed.identityId)
  }

  serviceForIdentity (identity, type) {
    identity.services = identity.services || {}

    if (type === 'local') {
      identity.services.local = identity.services.local || {
        encryptionStrategy: 'none'
      }

      return identity.services.local
    }

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

  getLocalEncryptionFunction (identity) {
    const service = this.serviceForIdentity(identity, 'local')

    if (service.encryptionStrategy === 'ask') {
      return encrypt('service.key')
    } else {
      return passThrough()
    }
  }

  localSize (identity) {
    return this.localCacheAdapter.getSize(this.identityToLocal(identity))
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
}

export default Queries
