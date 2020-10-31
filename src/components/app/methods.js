import { reactive } from 'vue'
import seed from '@/components/app/seed'
import { getFeed } from '@/components/app/fetcher'
import SERVICES from '@/components/app/services'
import async from 'no-async'
import utils from './utils'
import crypt from './crypt'

let nextFeedFetcher

const TWO_MINUTES = 1000 * 60 * 1

var methods = {
  fetchAllFeeds (identity, override, done) {
    var _ = this
    var updatedAt = Date.now()

    if (_.app.loading) return

    _.app.loading = true

    async.eachParallel(identity.feeds.filter(utils.filters.UNPAUSED), function (feed, next) {
      _.fetchFeed(identity, feed, updatedAt, override, next)
    }, function () {
      _.app.loading = false
      _.app.save()

      if (typeof done === 'function') {
        done()
      }
    })
  },

  fetchNextFeed (identity) {
    var _ = this
    var updatedAt = Date.now()

    var feed = identity.feeds.filter(utils.filters.UNPAUSED).sort(utils.sorters.LAST_UPDATED)[0]

    if (_.app.loading || !feed) {
      setTimeout(function () {
        _.fetchNextFeed(identity)
      }, utils.feedFetcherDuration(identity))

      return
    }

    _.fetchFeed(identity, feed, updatedAt, true, function () {
      _.app.save()

      setTimeout(function () {
        _.fetchNextFeed(identity)
      }, utils.feedFetcherDuration(identity))
    })
  },

  fetchFeed (identity, feed, updatedAt, override, done) {
    var _ = this

    updatedAt = updatedAt || Date.now()

    if (!override && feed._updatedAt && feed._updatedAt > updatedAt - utils.HALF_HOUR) {
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

    utils.trimItems(_.app.identity)

    _.app.store.setItem(
      _.app.identity.id,
      crypt.en(
        _.app,
        _.app.identity,
        utils.mappers.IDENTITY_LOCAL(_.app.identity)
      )
    )

    if (typeof done === 'function') {
      done()
    }
  },

  save (done) {
    this.saveLocal(() => {
      this.sync(done)
    })
  },

  sync (done) {
    const proxy = this.app.findService(this.app.identity, 'sync')

    if (!proxy) {
      return
    }

    proxy.request(proxy.app, proxy.app.identity, {
      action: 'sync',
      identity: utils.mappers.IDENTITY_REMOTE(this.app.identity)
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

  dateFormat (date, now) {
    return utils.timeAgo(new Date(date), now)
  },

  getVideoSrc: utils.getVideoSrc,

  getAudioSrc: utils.getAudioSrc,

  hasMedia (item) {
    return utils.getVideoSrc(item) || utils.getAudioSrc(item)
  },

  setMediaVerb (item) {
    if (item._mediaVerb) {
      return item._mediaVerb
    }

    if (utils.getVideoSrc(item)) {
      item._mediaVerb = 'watch'
    } else if (utils.getAudioSrc(item)) {
      item._mediaVerb = 'listen'
    } else {
      item._mediaVerb = 'read'
    }

    return item._mediaVerb
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

  getAskSecretKey (identity, reset) {
    var _ = this

    if (reset) {
      delete _.app.keychain[identity.id]
    }

    if (!_.app.keychain[identity.id]) {
      _.app.keychain[identity.id] = prompt('What is your secret key?')

      if (_.app.keychain[identity.id] === null && reset) {
        identity.services.local.strategy = 'rotate'
        var key = utils.generateId()
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
      key = utils.generateId()
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

  decryptIdentity (identity, done) {
    if (identity._decrypted) {
      return done()
    }

    this.store.getItem(identity.id, (err, state) => {
      if (!state) {
        return done()
      }

      state = crypt.de(this.app, identity, state)

      if (identity.services.local.strategy === 'ask') {
        delete this.app.keychain[identity.id]
        state = crypt.de(this.app, identity, state)
      }

      if (!state) {
        if (confirm('Unauthorized. Would you like to refresh this page?')) {
          window.location.reload()
        } else {
          document.body.innerHTML = ''
        }

        return
      }

      this.app.copyAttrs(state, identity, ['name', 'local', 'items', 'feeds', 'services'])

      identity._decrypted = true

      done()
    })
  },

  copyAttrs (from, to, attrs) {
    for (var i = attrs.length - 1; i >= 0; i--) {
      to[attrs[i]] = from[attrs[i]]
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

    utils.setIdentityDefaults(identity)

    _.app.identity = identity
    _.app.loading = true

    _.decryptIdentity(identity, function () {
      utils.setIdentityDefaults(identity)

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

  blankifyLinks (str) {
    return utils.stripScriptsAndStyles(
      (str || '')
        .replace(/target=['"]?[^"']+['"\s>]?/g, '')
        .replace(/<a([^>]+)>?/g, '<a$1 target="_blank">')
    )
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

  unsubscribeFeed (feed, redirect) {
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
    if (this.app.isMemberExpired(feed)) return 'is-expired'
    if (this.app.isMemberExpiring(feed)) return 'is-expiring'
    if (this.app.isMember(feed)) return 'is-member'

    return 'is-nonmember'
  },

  editMembership (feed, intent) {
    this.app.membership.feed = feed
    this.app.membership.intent = intent || 'login'
  },

  updateNow () {
    setInterval(() => {
      this.now = new Date()
    }, 60000)
  },

  setupApp (app) {
    app.loading = true

    utils.constructIdentities(app, (identities, keychain) => {
      app.keychain = keychain

      if (!identities || !identities.length) {
        identities = seed
        app.$router.push('/splash')
      }

      for (var i = identities.length - 1; i >= 0; i--) {
        utils.setIdentityDefaults(identities[i])
      }

      app.identities = identities
      app.setIdentity(identities[0])
      app.updateNow()
    })
  }
}

export default methods
