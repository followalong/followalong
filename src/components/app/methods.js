import { reactive } from 'vue'
import { Base64 } from 'js-base64'
import sorter from '@/components/app/sorter'
import { getFeed } from '@/components/app/fetcher'
import SERVICES from '@/components/app/services'
import aes256 from 'aes256'
import uniqId from 'uniq-id'
import copy from 'copy-to-clipboard'
import async from 'no-async'
import loadExternal from 'load-external'
import { saveAs } from 'file-saver'
import truncate from 'trunc-html'

var HALF_HOUR = 1000 * 60 * 60 * 0.5
var TWO_MINUTES = 1000 * 60 * 1
var ALLOWED_TAGS = [
  'a', 'article', 'b', 'blockquote', 'br', 'caption', 'code', 'del', 'details', 'div', 'em',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'main', 'ol',
  'p', 'pre', 'section', 'span', 'strike', 'strong', 'sub', 'summary', 'sup', 'table',
  'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul'
]
var SCRIPT_CACHE = {}
var nextFeedFetcher

function LAST_UPDATED (a, b) {
  if (a._updatedAt < b._updatedAt) return -1
  if (a._updatedAt > b._updatedAt) return 1
  return 0
}

function UNPAUSED (feed) {
  return !feed.paused
}

function ITEM_MAP (item) {
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
}

function stripScriptsAndStyles (s) {
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
}

var VIDEO_TYPES = /\.(mp4)/
var AUDIO_TYPES = /\.(mp3|wav)/

function getVideoSrc (item, autoplay) {
  if (!item) {
    return undefined
  }

  if (item.guid && item.guid.slice(0, 9) === 'yt:video:') {
    return 'https://www.youtube.com/embed/' + item.guid.slice(9) + (autoplay ? '?&rel=0&modestbranding=1&playsinline=1&autoplay=1' : '')
  } else if (item.enclosure && VIDEO_TYPES.test(item.enclosure.url)) {
    return item.enclosure.url
  }

  return undefined
}

function getAudioSrc (item) {
  if (!item) {
    return undefined
  }

  if (item.link && AUDIO_TYPES.test(item.link)) {
    return item.link
  } else if (item.enclosure && AUDIO_TYPES.test(item.enclosure.url)) {
    return item.enclosure.url
  }

  return undefined
}

function timeAgo (date, now) {
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
}

var methods = {
  fetchAllFeeds (identity, override, done) {
    var _ = this
    var updatedAt = Date.now()

    if (_.app.loading) return

    _.app.loading = true

    async.eachParallel(identity.feeds.filter(UNPAUSED), function (feed, next) {
      _.fetchFeed(identity, feed, updatedAt, override, next)
    }, function () {
      _.app.loading = false
      _.app.save()

      if (typeof done === 'function') {
        done()
      }
    })
  },

  feedFetcherDuration (identity) {
    return HALF_HOUR / identity.feeds.length
  },

  fetchNextFeed (identity) {
    var _ = this
    var updatedAt = Date.now()

    var feed = identity.feeds.filter(UNPAUSED).sort(LAST_UPDATED)[0]

    if (_.app.loading || !feed) {
      setTimeout(function () {
        _.fetchNextFeed(identity)
      }, _.feedFetcherDuration(identity))

      return
    }

    _.fetchFeed(identity, feed, updatedAt, true, function () {
      _.app.save()

      setTimeout(function () {
        _.fetchNextFeed(identity)
      }, _.feedFetcherDuration(identity))
    })
  },

  fetchFeed (identity, feed, updatedAt, override, done) {
    var _ = this

    updatedAt = updatedAt || Date.now()

    if (!override && feed._updatedAt && feed._updatedAt > updatedAt - HALF_HOUR) {
      return done()
    }

    feed.loading = true

    getFeed(_.app.findService(_.app.identity, 'rss', true), identity.items, feed, updatedAt, function () {
      feed.loading = false

      if (typeof done === 'function') {
        done()
      }
    })
  },

  saveLocal (done) {
    var _ = this

    _.app.trimItems(_.app.identity)

    _.app.store.setItem(
      _.app.identity.id,
      _.app.encrypt(
        _.app.identity,
        _.app.toLocal(_.app.identity)
      )
    )

    if (typeof done === 'function') {
      done()
    }
  },

  save (done) {
    var _ = this

    _.saveLocal(function () {
      _.sync(done)
    })
  },

  sync (done) {
    var _ = this
    var proxy = _.app.findService(_.app.identity, 'sync')

    if (!proxy) {
      return
    }

    proxy.request(proxy.app, proxy.app.identity, {
      action: 'sync',
      identity: _.app.toRemote(_.app.identity)
    }, function (err, data) {
      if (typeof done === 'function') {
        done(err, data)
      }
    })
  },

  saveForLater (item) {
    var _ = this

    item._updatedAt = Date.now()
    item.isSaved = !item.isSaved

    _.app.save()
  },

  setIdentityDefaults (identity) {
    var _ = this

    identity.id = identity.id || _.app.generateId()
    identity.name = identity.name || '...'
    identity.feeds = identity.feeds || []
    identity.items = identity.items || []

    identity.services = identity.services || {}
    identity.services.custom = identity.services.custom || []
    identity.services.rss = identity.services.rss || { symlink: 'followalong-free' }
    identity.services.sync = identity.services.sync || { symlink: 'followalong-none' }
    identity.services.publish = identity.services.publish || { symlink: 'followalong-none' }
    identity.services.search = identity.services.search || { symlink: 'followalong-free' }
    identity.services.media = identity.services.media || { symlink: 'followalong-none' }
    identity.services.local = identity.services.local || {
      strategy: 'none'
    }
    identity.services.local.maxReadCount = typeof identity.services.local.maxReadCount === 'undefined' ? 150 : parseInt(identity.services.local.maxReadCount)

    if (typeof identity._decrypted === 'undefined') {
      identity._decrypted = false
    }
  },

  trimItems (identity) {
    var _ = this
    var limit = parseInt(identity.services.local.maxReadCount)
    var items = _.app.newsfeed.filter(function (item) {
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

  dateFormat (date, now) {
    return timeAgo(new Date(date), now)
  },

  popout (item) {
    var _ = this

    if (_.app.playing === item) {
      _.app.playing = undefined
    } else {
      _.app.read(item, true)
      _.app.playing = item
    }
  },

  getVideoSrc,

  getAudioSrc,

  hasMedia (item) {
    return getVideoSrc(item) || getAudioSrc(item)
  },

  setMediaVerb (item) {
    if (item._mediaVerb) {
      return item._mediaVerb
    }

    if (getVideoSrc(item)) {
      item._mediaVerb = 'watch'
    } else if (getAudioSrc(item)) {
      item._mediaVerb = 'listen'
    } else {
      item._mediaVerb = 'read'
    }

    return item._mediaVerb
  },

  capitalize (str) {
    return str[0].toUpperCase() + str.slice(1, str.length)
  },

  isURL (q) {
    return /^http/.test(q)
  },

  fetchURL (url, items, _) {
    _ = _ || this

    var feed = reactive({ url: url })

    _.app.loading = true

    getFeed(_.app.findService(_.app.identity, 'rss', true), items, feed, Date.now(), function () {
      _.feed = feed

      items.forEach(function (item) {
        item.feed = _.feed
      })

      _.app.loading = false
    })
  },

  subscribe (feed, items) {
    var _ = this

    feed.identityId = _.app.identity.id
    feed.paused = false
    feed.loading = false

    _.app.identity.feeds.push(feed)
    _.app.identity.items.push.apply(_.app.identity.items, items)

    _.app.save()

    _.app.q = ''
    _.$router.push({ name: 'feed', params: { feed_url: feed.url } })
  },

  search (q) {
    var _ = this

    _.$router.push({ path: '/search', query: { q: q } })
  },

  toLocal (identity) {
    return {
      id: identity.id,
      name: identity.name,
      feeds: identity.feeds.map(function (feed) {
        return {
          url: feed.url,
          name: feed.name,
          _updatedAt: feed._updatedAt,
          paused: feed.paused,
          loading: false
        }
      }),
      items: identity.items.map(ITEM_MAP),
      services: identity.services
    }
  },

  toRemote (identity) {
    return {
      id: identity.id,
      name: identity.name,
      feeds: identity.feeds.map(function (feed) {
        return {
          url: feed.url,
          name: feed.name,
          _updatedAt: feed._updatedAt,
          paused: feed.paused,
          loading: false,
          unreads: identity.items.filter(function (item) {
            return !item.isRead && item.feedURL === feed.url
          }).map(function (item) {
            return item.guid
          })
        }
      }),
      items: identity.items.filter(function (item) {
        return item.isSaved
      }).map(ITEM_MAP),
      services: identity.services
    }
  },

  downloadIdentity (identity) {
    var _ = this
    var filename = window.location.host.replace(':', '.') + '.' + identity.id + '.json'
    var str = JSON.stringify(_.toRemote(identity))
    var blob = new Blob([str], { type: 'application/json;charset=utf-8' })

    saveAs(blob, filename)
  },

  read (item, val) {
    var _ = this
    var current = item.isRead

    if (typeof val === 'undefined') {
      val = !item.isRead
    } else if (val === current) {
      return
    }

    item._updatedAt = Date.now()
    item.isRead = val

    _.app.save()
  },

  filterBy (arr, attr, value) {
    return arr.filter(function (feed) {
      return feed[attr] === value
    })
  },

  reset (identity) {
    if (confirm('Are you sure you want to forget this identity?')) {
      var _ = this

      _.app.store.removeItem(identity.id, function () {
        _.app.store.removeItem('key-' + identity.id, function () {
          window.location.href = '/'
        })
      })
    }
  },

  encrypt (identity, json) {
    var _ = this
    var key = _.app.keychain[identity.id]
    var encrypted = json

    encrypted = typeof json === 'string' ? json : JSON.stringify(json)

    if (identity.services.local.strategy === 'none') {
      return encrypted
    } else if (identity.services.local.strategy === 'rotate') {
      key = _.app.generateId()
      _.app.saveKey(identity, key, true)
    } else if (identity.services.local.strategy === 'ask') {
      key = _.app.getAskSecretKey(identity, false)
    } else if (identity.services.local.strategy === 'store') {
      if (typeof _.app.keychain[identity.id] === 'undefined') {
        key = _.app.generateId()
        _.app.saveKey(identity, key, true)
      }
    }

    if (!key || !key.length) {
      return encrypted
    }

    encrypted = aes256.encrypt(key, encrypted)

    return encrypted
  },

  decrypt (identity, str) {
    var _ = this
    var key = _.app.keychain[identity.id]

    if (str && typeof str !== 'string') {
      return str
    } else if (typeof key === 'undefined') {
      try {
        str = JSON.parse(str)
      } catch (e) {
        try {
          key = _.app.getAskSecretKey(identity)

          if (key !== null) {
            str = JSON.parse(aes256.decrypt(key, str))

            if (typeof str === 'object' && str.services.local.strategy === 'store') {
              _.app.saveKey(identity, key, true)
              _.app.keychain[identity.id] = key
            }
          }
        } catch (e) {
          return false
        }
      }
    } else {
      try {
        str = JSON.parse(aes256.decrypt(key, str))
      } catch (e) { }
    }

    if (typeof str === 'object') {
      return str
    } else {
      return false
    }
  },

  getAskSecretKey (identity, reset) {
    var _ = this

    if (reset) {
      delete _.app.keychain[identity.id]
    }

    if (!_.app.keychain[identity.id]) {
      _.app.keychain[identity.id] = prompt('What is your secret key?')

      if (_.app.keychain[identity.id] === null && reset) {
        identity.services.local.strategy = 'rotate'
        var key = _.app.generateId()
        _.app.saveKey(identity, key, true)
        return key
      }
    }

    if (reset) {
      _.app.save()
    }

    return _.app.keychain[identity.id]
  },

  saveKey (identity, key, ignoreSave) {
    var _ = this

    if (identity.services.local.strategy === 'ask') {
      delete _.app.keychain[identity.id]
      key = undefined
    }

    if (identity.services.local.strategy === 'store' && !key) {
      key = _.app.generateId()
      _.app.keychain[identity.id] = key
    }

    if (key) {
      _.store.setItem('key-' + identity.id, key)
    } else {
      _.store.removeItem('key-' + identity.id)
    }

    if (!ignoreSave) {
      _.app.save()
    }
  },

  generateId () {
    return uniqId.generateUUID('xxxxyxxxxyxxxxyxxxxyxxxxyxxxxyxxxxyxxxxy', 32)()
  },

  copyConfig (identity) {
    var _ = this
    copy(Base64.encode(JSON.stringify(_.toRemote(identity))))

    alert('Copied configuration to clipboard.')
  },

  decryptIdentity (identity, done) {
    var _ = this

    if (identity._decrypted) {
      return done()
    }

    _.store.getItem(identity.id, function (err, state) {
      if (!state) {
        return done()
      }

      state = _.decrypt(identity, state)

      if (identity.services.local.strategy === 'ask') {
        delete _.app.keychain[identity.id]
        state = _.decrypt(identity, state)
      }

      if (!state) {
        if (confirm('Unauthorized. Would you like to refresh this page?')) {
          window.location.reload()
        } else {
          document.body.innerHTML = ''
        }

        return
      }

      _.app.copyAttrs(state, identity, ['name', 'local', 'items', 'feeds', 'services'])

      identity._decrypted = true

      done()
    })
  },

  copyAttrs (from, to, attrs) {
    for (var i = attrs.length - 1; i >= 0; i--) {
      to[attrs[i]] = from[attrs[i]]
    }
  },

  constructIdentities (done) {
    var _ = this
    var identities = []
    var keychain = {}

    _.store.keys(function (err, keys) {
      async.eachParallel(keys || [], function (id, next) {
        if (id === 'hints') {
          _.store.getItem(id, function (err, value) {
            if (typeof value === 'string') {
              value = JSON.parse(value || '')
            }

            _.app.hints = value
            next()
          })
        } else if (id.slice(0, 4) !== 'key-') {
          identities.push({ id: id })
          next()
        } else {
          _.store.getItem(id, function (err, value) {
            keychain[id.slice(4)] = value
            next()
          })
        }
      }, function () {
        done(identities, keychain)
      })
    })
  },

  cachedLoadExternal (url, done) {
    var _ = this

    if (SCRIPT_CACHE[url] === true) {
      done()
    } else if (SCRIPT_CACHE[url] instanceof Array) {
      SCRIPT_CACHE[url].push(done)
    } else {
      SCRIPT_CACHE[url] = [done]

      loadExternal(url, function () {
        for (var i = SCRIPT_CACHE[url].length - 1; i >= 0; i--) {
          SCRIPT_CACHE[url][i].call(_)
        }

        SCRIPT_CACHE[url] = true
      })
    }
  },

  hideHint (hint) {
    var _ = this

    _.app.hints.push(hint)
    _.app.store.setItem(
      'hints',
      JSON.stringify(_.app.hints)
    )
  },

  hintIsShown (hint) {
    var _ = this

    return _.app.hints.indexOf(hint) === -1
  },

  setIdentity (identity, override) {
    var _ = this

    identity = reactive(identity)

    _.app.setIdentityDefaults(identity)
    _.app.identity = identity
    _.app.loading = true

    _.decryptIdentity(identity, function () {
      _.app.setIdentityDefaults(identity)
      _.app.saveLocal()

      clearTimeout(nextFeedFetcher)

      _.app.loading = false

      _.fetchAllFeeds(identity, override, function () {
        nextFeedFetcher = setTimeout(function () {
          _.fetchNextFeed(_.app.identity)
        }, TWO_MINUTES)
      })
    })
  },

  mergeData (identity, remoteData) {
    if (!remoteData) {
      return
    }

    var localFeeds = identity.feeds || []
    var localItems = identity.items || []
    var remoteFeeds = remoteData.feeds || []
    var remoteItems = remoteData.items || []
    var localFeed; var remoteFeed
    var localItem; var remoteItem
    var i

    for (i = remoteFeeds.length - 1; i >= 0; i--) {
      remoteFeed = remoteFeeds[i]
      localFeed = localFeeds.find(function (f) {
        return f.url === remoteFeed.url
      })

      if (localFeed) {
        if (remoteFeed._updatedAt > localFeed._updatedAt) {
          localFeed.url = remoteFeed.url
          localFeed.name = remoteFeed.name
          localFeed._remoteUpdatedAt = remoteFeed._updatedAt
          localFeed.paused = remoteFeed.paused
        }
      } else {
        localFeeds.push(remoteFeed)
      }
    }

    for (i = remoteItems.length - 1; i >= 0; i--) {
      remoteItem = remoteItems[i]
      localItem = localItems.find(function (f) {
        return f.guid === remoteItem.guid
      })

      if (localItem) {
        if (remoteItem._updatedAt > localItem._updatedAt) {
          for (var key in remoteItem) {
            localItem[key] = remoteItem[key]
          }
        }
      } else {
        localItems.push(remoteItem)
      }
    }

    for (i = localFeeds.length - 1; i >= 0; i--) {
      localFeed = localFeeds[i]
      remoteFeed = remoteFeeds.find(function (f) {
        return f.url === remoteFeed.url
      })

      if (!remoteFeed) {
        localFeeds.splice(i, 1)
      }
    }

    for (i = localItems.length - 1; i >= 0; i--) {
      localItem = localItem[i]
      remoteItem = remoteItems.find(function (f) {
        return f.url === remoteItem.url
      })

      if (!remoteItem) {
        localItem.splice(i, 1)
      }
    }
  },

  blankifyLinks (str) {
    return stripScriptsAndStyles(
      (str || '')
        .replace(/target=['"]?[^"']+['"\s>]?/g, '')
        .replace(/<a([^>]+)>?/g, '<a$1 target="_blank">')
    )
  },

  prepDescription (item, characterLimit, ellipsis) {
    var _ = this

    if (!item || !item.content) {
      return ''
    }

    return _.app.blankifyLinks(truncate(
      item.content,
      characterLimit,
      {
        sanitizer: {
          allowedTags: ALLOWED_TAGS
        }
      }
    ).html)
  },

  profileSize (identity, type) {
    if (!identity || !identity.items) return 'N/A'

    var _ = this
    var unit = 'b'
    var size = JSON.stringify(_.app['to' + type](identity)).length

    if (size > 1000000) {
      size = size / 1000000
      unit = 'mb'
    } else if (size > 1000) {
      size = size / 1000
      unit = 'kb'
    }

    return '~' + (Math.round(size * 10) / 10) + ' ' + unit
  },

  toggleSidebar (doHide) {
    var _ = this

    if (doHide || _.app.sidebarClass === 'show') {
      _.app.sidebarClass = ''
      document.body.style.overflow = ''
    } else {
      _.app.sidebarClass = 'show'
      document.body.style.overflow = 'hidden'
    }
  },

  findService (identity, type, forceResult) {
    if (!identity || !identity.services) {
      return
    }

    var _ = this
    var service = identity.services[type]

    if (!service && forceResult) {
      service = identity.services[type] = { symlink: 'followalong-free' }
    }

    if (service && service.symlink) {
      service = SERVICES.concat(identity.services.custom).find(function (s) {
        return s.id === service.symlink
      })
    }

    if (service) {
      var template = SERVICES.find(function (s) {
        return s.id === service.template
      })

      if (template) {
        var items = ['fields', 'pricing', 'description', 'request']

        for (var i = items.length - 1; i >= 0; i--) {
          service[items[i]] || Object.defineProperty(service, items[i], {
            value: template[items[i]],
            enumerable: false
          })
        }
      }

      if (!service.app) {
        Object.defineProperty(service, 'app', {
          value: _.app,
          enumerable: false
        })
      }
    }

    return service
  },

  removeService (identity, service) {
    var _ = this
    var arr = identity.services.custom

    if (confirm('Are you sure you want to remove this service?')) {
      arr.splice(arr.indexOf(service), 1)
    }

    _.app.save()
  },

  downloadService (service) {
    service = JSON.parse(JSON.stringify({
      id: service.id,
      template: service.template,
      data: service.data
    }))

    service.template = service.template || service.id

    var filename = window.location.host.replace(':', '.') + '.' + service.id + '.json'
    var str = JSON.stringify(service)
    var blob = new Blob([str], { type: 'application/json;charset=utf-8' })

    saveAs(blob, filename)
  },

  copyService (service) {
    service = JSON.parse(JSON.stringify({
      id: service.id,
      template: service.template,
      data: service.data
    }))

    service.template = service.template || service.id

    copy(Base64.encode(JSON.stringify(service)))

    alert('Copied service to clipboard.')
  },

  isBase64 (str) {
    return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(str)
  },

  unsubscribe (feed, redirect) {
    if (!confirm('Are you sure you want to unsubscribe from this feed?')) return

    var _ = this
    var index = _.app.identity.feeds.indexOf(feed)

    _.app.identity.items.filter(function (item) {
      return item.feedURL === feed.url
    }).forEach(function (item) {
      _.app.identity.items.splice(_.app.identity.items.indexOf(item), 1)
    })

    _.app.identity.feeds.splice(index, 1)
    _.app.save(function () {
      if (redirect) {
        _.app.$router.push('/')
      }
    })
  },

  isMemberable (feed) {
    return false
  },

  isMember (feed) {
    return false
  },

  isMemberExpiring (feed) {
    return false // feed.membership && feed.membership.expireAt & feed.membership.expireAt < new Date();
  },

  isMemberExpired (feed) {
    return false// feed.membership && feed.membership.expireAt & feed.membership.expireAt < new Date();
  },

  isHelpable (feed) {
    return this.isMemberable(feed)
  },

  membershipClass (feed) {
    var _ = this

    if (_.app.isMemberExpired(feed)) return 'is-expired'
    if (_.app.isMemberExpiring(feed)) return 'is-expiring'
    if (_.app.isMember(feed)) return 'is-member'

    return 'is-nonmember'
  },

  editMembership (feed, intent) {
    var _ = this

    _.app.membership.feed = feed
    _.app.membership.intent = intent || 'login'
  },

  pictureInPicture (item) {

  }

  // serviceShouldPromptCredentials(service, data) {
  //     if (service.pricing) {
  //         for (var key in service.fields) {
  //             if (service.fields[key].credential && !service.data[key]) {
  //                 return true;
  //             }
  //         }
  //     }

  //     return false;
  // }
}

export default methods
