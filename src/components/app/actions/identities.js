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
    }, done)
  },

  save (identity, done) {
    this.saveLocal(identity, () => {
      this.sync(identity, done)
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

    if (_.app.loading) return

    _.app.loading = true

    async.eachParallel(identity.feeds.filter(utils.filters.UNPAUSED), function (feed, next) {
      _.fetchFeed(identity, feed, updatedAt, override, next)
    }, function () {
      _.app.loading = false
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

    if (_.app.loading || !feed) {
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

    getFeed(_.app.findService(_.app.identity, 'rss', true), identity.items, feed, updatedAt, function () {
      feed.loading = false

      if (typeof done === 'function') {
        done()
      }
    })
  },

  subscribe (feed, items) {
    var _ = this

    feed.identityId = _.app.identity.id
    feed.paused = false
    feed.loading = false

    _.app.identity.feeds.push(feed)
    _.app.identity.items.push.apply(_.app.identity.items, items)

    _.app.save(_.app.identity)

    _.app.q = ''
    _.$router.push({ name: 'feed', params: { feed_url: feed.url } })
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
    _.app.save(_.app.identity, function () {
      if (redirect) {
        _.app.$router.push('/')
      }
    })
  }
}
