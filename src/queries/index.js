import SERVICES from '@/commands/services.js'
import sortByReadAndDate from './sorters/sort-by-read-and-date.js'
import { getAudioSrc, getVideoSrc, getImageSrc } from './get-src.js'

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

    return this.state.findAll('items', (i) => i.feedUrl === feed.url).sort(sortByReadAndDate())
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
    return this.state.findAll('feeds', (f) => f.identityId === identity.id).sort(sortByReadAndDate)
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
}

export default Queries
