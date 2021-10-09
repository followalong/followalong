import Parser from 'rss-parser'

var parser = new Parser({
  customFields: {
    item: ['media:group', 'content:encoded']
  }
})

function getContent (identity, service, url, done) {
  if (!service) {
    return done()
  }

  service.request(identity, {
    action: 'rss',
    url: url
  }, function (err, data) {
    if (data && parseInt(data.status) < 300) {
      return done(undefined, data.body)
    }

    done(typeof data === 'object' ? data.body : 'Could not fetch feed. If you\'re not already, Try using a CORS proxy service (in Setup).')
  })
}

function parseItems (identity, feed, data, items, updatedAt, done) {
  parser.parseString(data, function (err, data) {
    if (err) {
      feed.error = 'Could not parse feed. Feed does not seem to be formatted correctly.'
      console.error(err)
      done(err)
      return
    } else {
      delete feed.error
    }

    done(undefined, data)
  })
}

function getFeed (identity, service, feed, updatedAt) {
  return new Promise((resolve, reject) => {
    if (!identity || !service || !feed || !updatedAt) {
      return reject(new Error('Missing data'))
    }

    getContent(identity, service, feed.url, function (err, data) {
      if (err || !data) {
        return reject(err || 'Feed has no data')
      } else {
        delete feed.error
      }

      parseItems(identity, feed, data, [], updatedAt, (err, result) => {
        if (err) {
          return reject(err || 'Could not parse items')
        }

        resolve(result)
      })
    })
  })
}

export {
  getContent,
  parseItems,
  getFeed
}
