import Parser from 'rss-parser'

var parser = new Parser({
  customFields: {
    item: ['media:group', 'content:encoded']
  }
})

function getContent (identity, addon, url) {
  return new Promise((resolve, reject) => {
    addon.rss(url)
      .then((data) => {
        if (data && parseInt(data.status) < 300) {
          return resolve(data.body)
        }

        reject(new Error(typeof data === 'object' ? data.body : 'Could not fetch feed. If you\'re not already, Try using a CORS proxy addon (in Setup).'))
      })
      .catch(reject)
  })
}

function parseItems (identity, feed, data, updatedAt) {
  return new Promise((resolve, reject) => {
    parser.parseString(data, function (err, data) {
      if (err) {
        feed.error = 'Could not parse feed. Feed does not seem to be formatted correctly.'
        return reject(err)
      } else {
        delete feed.error
      }

      resolve(data)
    }).catch(reject)
  })
}

function getFeed (identity, addon, feed, updatedAt) {
  return new Promise((resolve, reject) => {
    if (!identity || !addon || !feed || !updatedAt) {
      return reject(new Error('Missing data'))
    }

    getContent(identity, addon, feed.url)
      .then((data) => {
        delete feed.error

        parseItems(identity, feed, data, updatedAt)
          .then(resolve)
          .catch((err) => reject(err))
      })
      .catch((err) => reject(err))
  })
}

export {
  getContent,
  parseItems,
  getFeed
}
