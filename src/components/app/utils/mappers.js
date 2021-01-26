export default {
  MAPPER_ITEM (item) {
    return {
      author: item.author,
      feedURL: item.feedURL,
      guid: item.guid,
      image: item.image,
      isRead: item.isRead,
      isSaved: item.isSaved,
      link: item.link,
      enclosure: item.enclosure,
      pubDate: item.pubDate,
      title: item.title,
      content: item.content,
      _updatedAt: item._updatedAt
    }
  },

  IDENTITY_LOCAL (identity) {
    return {
      id: identity.id,
      name: identity.name,
      hints: identity.hints,
      feeds: identity.feeds.map(function (feed) {
        return {
          url: feed.url,
          name: feed.name,
          _updatedAt: feed._updatedAt,
          paused: feed.paused
        }
      }),
      items: identity.items.map(this.MAPPER_ITEM),
      services: identity.services
    }
  },

  IDENTITY_REMOTE (identity) {
    return {
      id: identity.id,
      name: identity.name,
      hints: identity.hints,
      feeds: identity.feeds.map(function (feed) {
        return {
          url: feed.url,
          name: feed.name,
          _updatedAt: feed._updatedAt,
          paused: feed.paused,
          unreads: identity.items.filter(function (item) {
            return !item.isRead && item.feedURL === feed.url
          }).map(function (item) {
            return item.guid
          })
        }
      }),
      items: identity.items.filter(function (item) {
        return item.isSaved
      }).map(this.MAPPER_ITEM),
      services: identity.services
    }
  }
}
