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

    if (identity.isLoading) return

    identity.isLoading = true

    async.eachParallel(identity.feeds.filter(utils.filters.UNPAUSED), function (feed, next) {
      feed.fetch(_.app, updatedAt, override, next)
    }, function () {
      identity.isLoading = false
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

    if (identity.isLoading || !feed) {
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

    identity.addFeed(feed)
    _.app.addItemsToIdentity(identity, items)

    identity.save()

    _.app.q = ''
    _.$router.push({ name: 'feed', params: { feed_url: feed.url } })
  },

  unsubscribeFeed (app, identity, feed, redirect) {
    if (!confirm('Are you sure you want to unsubscribe from this feed?')) return

    feed.items.forEach((item) => item.destroy())
    feed.destroy()

    identity.save(function () {
      if (redirect) {
        app.$router.push('/')
      }
    })
  },

  addItemsToIdentity (identity, items) {
    return items.map((item) => {
      if (item.constructor.name !== 'Instance') {
        item = models.item.create(item)
      }

      // TODO: identity.items relationship
      identity.items.push(item)

      return item
    })
  }
}
