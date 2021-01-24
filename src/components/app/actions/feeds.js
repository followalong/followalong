import async from 'no-async'
import utils from '../utils'
import { getFeed } from '@/components/app/fetcher'

export default {
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
