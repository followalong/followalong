function sorter (identity, date, feed) {
  if (!date) {
    date = 'pubDate'
  }

  return function sorter (a, b) {
    if (typeof a.feed === 'undefined') {
      Object.defineProperty(a, 'feed', {
        value: feed || identity.feeds.find(function (feed) {
          return a.feedURL === feed.url
        }),
        enumerable: false
      })
    }

    if (typeof b.feed === 'undefined') {
      Object.defineProperty(b, 'feed', {
        value: feed || identity.feeds.find(function (feed) {
          return b.feedURL === feed.url
        }),
        enumerable: false
      })
    }

    if (date !== '_updatedAt') {
      if (!a.isRead && b.isRead) return -1
      if (a.isRead && !b.isRead) return 1

      if (typeof a[date] !== 'object') {
        a[date] = new Date(a[date])
      }

      if (typeof b[date] !== 'object') {
        b[date] = new Date(b[date])
      }
    }

    if (a[date] > b[date]) return -1
    if (a[date] < b[date]) return 1

    return 0
  }
}

export default sorter
