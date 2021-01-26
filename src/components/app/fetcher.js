import Parser from 'rss-parser'
import utils from './utils'

var parser = new Parser({
  customFields: {
    item: ['media:group', 'content:encoded']
  }
})

function getContent (service, url, done) {
  if (!service) {
    return done()
  }

  service.request(service.app, service.app.identity, {
    action: 'rss',
    url: url
  }, function (err, data) {
    if (data && parseInt(data.status) < 300) {
      return done(undefined, data.body)
    }

    done(typeof data === 'object' ? data.body : 'Could not fetch feed. If you\'re not already, Try using a CORS proxy service (in Setup).')
  })
}

function parseItems (app, feed, data, items, updatedAt, done) {
  var lastUpdate = feed._updatedAt || new Date(0)

  parser.parseString(data, function (err, data) {
    if (err) {
      feed.error = 'Could not parse feed. Feed does not seem to be formatted correctly.'
      console.error(err)
      done(err)
      return
    } else {
      delete feed.error
    }

    feed.lastFetchCount = data.items.length
    feed.name = data.title || data.name || feed.name
    feed.description = feed.description || data.description

    if (updatedAt) {
      feed._updatedAt = updatedAt
    }

    data.items.forEach(function (newItem) {
      newItem.guid = newItem.guid || newItem.id || utils.generateId()

      try {
        newItem.image = newItem['media:group']['media:thumbnail'][0].$
        delete newItem['media:group']
      } catch (e) { }

      var oldItem = items.find(function (oldItem) {
        return oldItem.guid === newItem.guid
      })

      if (oldItem) {
        for (var key in newItem) {
          oldItem[key] = newItem[key]
        }

        newItem = oldItem
      } else {
        newItem.guid = newItem.guid || utils.generateId()
        newItem.isSaved = false
        newItem._updatedAt = updatedAt

        if (feed.unreads && feed.unreads.indexOf(newItem.guid) !== -1) {
          newItem.isRead = false
        } else if (new Date(newItem.pubDate) < lastUpdate) {
          newItem.isRead = true
        } else {
          newItem.isRead = false
        }

        newItem = app.addItemsToIdentity(app.identity, feed, [newItem])[0]
      }

      newItem.pubDate = newItem.pubDate || newItem.pubdate || newItem.date
      newItem.content = newItem['content:encoded'] || newItem.content || newItem.summary || newItem.description

      if (newItem.content) {
        newItem.content = newItem.content.replace('<![CDATA[', '').replace(']]>', '')
      }

      newItem.feedURL = feed.url
    })

    delete feed._remoteUpdatedAt
    delete feed.unreads

    done(undefined, data.items)
  })
}

function getFeed (service, items, feed, updatedAt, callback, forEachCallback) {
  if (!service) {
    return callback()
  }

  getContent(service, feed.url, function (err, data) {
    if (err || !data) {
      feed.error = err || 'Feed has no data'
      console.error(feed.error)
      callback(feed.error)
      return
    } else {
      delete feed.error
    }

    parseItems(service.app, feed, data, items, updatedAt, callback)
  })
}

export {
  getContent,
  parseItems,
  getFeed
}
