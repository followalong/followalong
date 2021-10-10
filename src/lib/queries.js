import utils from '@/lib/utils/index.js'
import SERVICES from '@/lib/services'
import sorter from '@/lib/sorter'

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
    return this.state.findAll('feeds', (f) => f.identityId === identity.id).sort(utils.sorters.NAME)
  }

  itemsForIdentity (identity) {
    return this.feedsForIdentity(identity)
      .reduce((items, f) => items.concat(this.itemsForFeed(f)), [])
      .sort(sorter())
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
}

export default Queries
