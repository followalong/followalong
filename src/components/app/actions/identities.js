import utils from '../utils'
import SERVICES from '@/components/app/services'
import async from 'no-async'
import models from '@/models/index.js'

export default {
  findService (services, type, forceResult) {
    if (!services) {
      return
    }

    var service = services[type]

    if (!service && forceResult) {
      service = services[type] = { symlink: 'followalong-free' }
    }

    if (service && service.symlink) {
      service = SERVICES.concat(services.custom).find(function (s) {
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
    }

    return service
  },

  sync (identity, done) {
    const proxy = this.app.findService(identity.services, 'sync')

    if (!proxy) {
      return
    }

    proxy.request(identity, {
      action: 'sync',
      identity: utils.mappers.IDENTITY_REMOTE(identity)
    }, function (err, data) {
      if (typeof done === 'function') {
        done(err, data)
      }
    })
  },

  hideHint (identity, hint) {
    if (identity.hints.indexOf(hint) === -1) {
      identity.hints.push(hint)
    }

    identity.save()
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
      feed.fetch(_.app, updatedAt, override, next)
    }, function () {
      _.app.loading = false
      identity.save()

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

    feed.fetch(_.app, updatedAt, true, function () {
      identity.save()

      setTimeout(function () {
        _.fetchNextFeed(identity)
      }, utils.feedFetcherDuration(identity))
    })
  },

  subscribe (identity, feed, items) {
    var _ = this

    feed.identityId = identity.id
    feed.paused = false
    feed.loading = false

    _.app.addFeedToIdentity(identity, feed)
    _.app.addItemsToIdentity(identity, feed, items)

    identity.save()

    _.app.q = ''
    _.$router.push({ name: 'feed', params: { feed_url: feed.url } })
  },

  unsubscribeFeed (app, identity, feed, redirect) {
    if (!confirm('Are you sure you want to unsubscribe from this feed?')) return

    var index = identity.feeds.indexOf(feed)

    identity.items.filter(function (item) {
      return item.feedURL === feed.url
    }).forEach(function (item) {
      identity.items.splice(identity.items.indexOf(item), 1)
    })

    identity.feeds.splice(index, 1)

    identity.save(function () {
      if (redirect) {
        app.$router.push('/')
      }
    })
  },

  addFeedToIdentity (identity, feed) {
    feed.identity = identity

    feed = models.feed.create(feed)

    identity.feeds.push(feed)
  },

  addItemsToIdentity (identity, feed, items) {
    return items.map((item) => {
      item = models.item.create(item)

      identity.items.push(item)

      return item
    })
  }
}
