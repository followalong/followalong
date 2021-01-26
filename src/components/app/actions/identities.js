import utils from '../utils'
import async from 'no-async'
import models from '@/models/index.js'

export default {
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

    if (feed.constructor.name === 'Instance') {
      feed.save()
    } else {
      feed = models.feed.create(feed)
    }

    identity.feeds.push(feed)

    return feed
  },

  addItemsToIdentity (identity, feed, items) {
    return items.map((item) => {
      if (item.constructor.name !== 'Instance') {
        item = models.item.create(item)
      }

      identity.items.push(item)

      return item
    })
  }
}
