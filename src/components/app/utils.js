import loadExternal from 'load-external'
import sorter from '@/components/app/sorter'

const TWO_MINUTES = 1000 * 60 * 1
const HALF_HOUR = 1000 * 60 * 60 * 0.5
const BASE64_CHARACTERS = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/
const VIDEO_TYPES = /\.(mp4)/
const AUDIO_TYPES = /\.(mp3|wav)/
const srcCache = {}

export default {
  TWO_MINUTES,
  HALF_HOUR,

  feedFetcherDuration (identity) {
    return HALF_HOUR / identity.feeds.length
  },

  trimItems (identity) {
    var limit = parseInt(identity.services.local.maxReadCount)
    var items = identity.items.filter(function (item) {
      return item.isRead && !item.isSaved && !item.isPlaying
    }).sort(sorter(identity))
    var itemsLength = items.length
    var item; var i

    for (i = itemsLength - 1; i >= 0; i--) {
      if (itemsLength <= limit) {
        break
      }

      item = items[i]

      if (!item) continue

      identity.items.splice(identity.items.indexOf(item), 1)
      itemsLength--
    }
  },

  isBase64 (str) {
    return BASE64_CHARACTERS.test(str)
  },

  sorters: {
    LAST_UPDATED (a, b) {
      if (a._updatedAt < b._updatedAt) return -1
      if (a._updatedAt > b._updatedAt) return 1
      return 0
    },

    NAME (a, b) {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    }
  },

  filters: {
    UNPAUSED (feed) {
      return !feed.paused
    }
  },

  mappers: {
    ITEM (item) {
      return {
        author: item.author,
        feedURL: item.feedURL,
        guid: item.guid,
        image: item.image,
        isRead: item.isRead,
        isSaved: item.isSaved,
        link: item.link,
        enclosure: item.enclosure,
        pubDate: item.pubDate,
        title: item.title,
        content: item.content,
        _updatedAt: item._updatedAt
      }
    },
  }

  stripScriptsAndStyles (s) {
    var div = document.createElement('div')
    var scripts; var i

    div.innerHTML = s

    scripts = div.getElementsByTagName('script')

    for (i = scripts.length - 1; i >= 0; i--) {
      scripts[i].parentNode.removeChild(scripts[i])
    }

    scripts = div.getElementsByTagName('style')

    for (i = scripts.length - 1; i >= 0; i--) {
      scripts[i].parentNode.removeChild(scripts[i])
    }

    return div.innerHTML
  },

  getVideoSrc (item, autoplay) {
    if (!item) {
      return undefined
    }

    if (item.guid && item.guid.slice(0, 9) === 'yt:video:') {
      return 'https://www.youtube.com/embed/' + item.guid.slice(9) + (autoplay ? '?&rel=0&modestbranding=1&playsinline=1&autoplay=1' : '')
    } else if (item.enclosure && VIDEO_TYPES.test(item.enclosure.url)) {
      return item.enclosure.url
    }

    return undefined
  },

  getAudioSrc (item) {
    if (!item) {
      return undefined
    }

    if (item.link && AUDIO_TYPES.test(item.link)) {
      return item.link
    } else if (item.enclosure && AUDIO_TYPES.test(item.enclosure.url)) {
      return item.enclosure.url
    }

    return undefined
  },

  timeAgo (date, now) {
    if (typeof date !== 'object') {
      date = new Date(date)
    }

    var seconds = Math.floor(((now || new Date()) - date) / 1000)
    var interval = Math.floor(seconds / 31536000)
    var intervalType

    if (interval >= 1) {
      intervalType = 'year'
    } else {
      interval = Math.floor(seconds / 2592000)

      if (interval >= 1) {
        intervalType = 'month'
      } else {
        interval = Math.floor(seconds / 86400)

        if (interval >= 1) {
          intervalType = 'day'
        } else {
          interval = Math.floor(seconds / 3600)

          if (interval >= 1) {
            intervalType = 'hour'
          } else {
            interval = Math.floor(seconds / 60)

            if (interval >= 1) {
              intervalType = 'minute'
            } else {
              interval = seconds
              intervalType = 'second'
            }
          }
        }
      }
    }

    if (interval > 1 || interval === 0) {
      intervalType += 's'
    }

    return interval + ' ' + intervalType + ' ago'
  },

  cachedLoadExternal (url, done) {
    if (srcCache[url]) {
      return done()
    }

    srcCache[url] = true

    loadExternal(url, done)
  }
}
