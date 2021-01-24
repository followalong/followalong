import crypt from '../crypt'
import utils from '../utils'
import SERVICES from '@/components/app/services'
import async from 'no-async'
import { getFeed } from '@/components/app/fetcher'

export default {
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
          service[items[i]] = service[items[i]] || template[items[i]]
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

  sync (identity, done) {
    const proxy = this.app.findService(identity, 'sync')

    if (!proxy) {
      return
    }

    proxy.request(proxy.app, identity, {
      action: 'sync',
      identity: utils.mappers.IDENTITY_REMOTE(identity)
    }, function (err, data) {
      if (typeof done === 'function') {
        done(err, data)
      }
    })
  },

  save (identity, done) {
    this.app.saveLocal(identity, () => {
      this.app.sync(identity, done)
    })
  },

  saveLocal (identity, done) {
    var _ = this

    utils.trimItems(identity)

    _.app.store.setItem(
      identity.id,
      crypt.en(
        _.app,
        identity,
        utils.mappers.IDENTITY_LOCAL(identity)
      )
    )

    if (typeof done === 'function') {
      done()
    }
  },

  hideHint (identity, hint) {
    var _ = this

    if (identity.hints.indexOf(hint) === -1) {
      identity.hints.push(hint)
    }

    _.app.save(identity)
  },

  hintIsShown (identity, hint) {
    return identity.hints.indexOf(hint) === -1
  },

  fetchAllFeeds (identity, override, done) {
    var _ = this
    var updatedAt = Date.now()

    if (_.app.isLoading) return

    _.app.isLoading = true

    async.eachParallel(identity.feeds.filter(utils.filters.UNPAUSED), function (feed, next) {
      _.fetchFeed(identity, feed, updatedAt, override, next)
    }, function () {
      _.app.isLoading = false
      _.app.save(identity)

      if (typeof done === 'function') {
        done()
      }
    })
  },

  fetchNextFeed (identity) {
    var _ = this
    var updatedAt = Date.now()

    var feed = identity.feeds.filter(utils.filters.UNPAUSED).sort(utils.sorters.LAST_UPDATED)[0]

    if (_.app.isLoading || !feed) {
      setTimeout(function () {
        _.fetchNextFeed(identity)
      }, utils.feedFetcherDuration(identity))

      return
    }

    _.fetchFeed(identity, feed, updatedAt, true, function () {
      _.app.save(identity)

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

    getFeed(_.app.findService(identity, 'rss', true), identity.items, feed, updatedAt, function () {
      feed.loading = false

      if (typeof done === 'function') {
        done()
      }
    })
  },

  subscribe (identity, feed, items) {
    var _ = this

    feed.identityId = identity.id
    feed.paused = false
    feed.loading = false

    _.app.addFeedToIdentity(identity, feed)
    _.app.addItemsToIdentity(identity, feed, items)

    _.app.save(identity)

    _.app.q = ''
    _.$router.push({ name: 'feed', params: { feed_url: feed.url } })
  },

  unsubscribeFeed (identity, feed, redirect) {
    if (!confirm('Are you sure you want to unsubscribe from this feed?')) return

    var _ = this
    var index = identity.feeds.indexOf(feed)

    identity.items.filter(function (item) {
      return item.feedURL === feed.url
    }).forEach(function (item) {
      identity.items.splice(identity.items.indexOf(item), 1)
    })

    identity.feeds.splice(index, 1)
    _.app.save(identity, function () {
      if (redirect) {
        _.app.$router.push('/')
      }
    })
  },

  addFeedToIdentity (identity, feed) {
    feed.save = () => {
      identity.save()
    }

    identity.feeds.push(feed)
  },

  addItemsToIdentity (identity, feed, items) {
    return items.map((item) => {
      item.feed = feed || identity.feeds.find(function (feed) {
        return item.feedURL === feed.url
      })

      item = this.app.models.item.create(item)

      identity.items.push(item)

      return item
    })
  }
}
