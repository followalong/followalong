class Formatters {
  constructor (queries) {
    this.queries = queries
  }

  identityToLocal (identity) {
    return {
      id: identity.id,
      name: identity.name,
      hints: identity.hints,
      feeds: this.queries.feedsForIdentity(identity)
        .map((feed) => this.feedToLocal(feed)),
      items: this.queries.itemsForIdentity(identity)
        .map((item) => this.itemToLocal(item)),
      services: identity.services
    }
  }

  identityToRemote (identity) {
    return {
      id: identity.id,
      name: identity.name,
      hints: identity.hints,
      feeds: this.queries.feedsForIdentity(identity)
        .map((feed) => this.feedToRemote(feed)),
      items: this.queries.itemsForIdentity(identity)
        .filter((item) => this.queries.isSaved(item))
        .map((item) => this.itemToRemote(item)),
      services: identity.services
    }
  }

  feedToLocal (feed) {
    return {
      updatedAt: feed.updatedAt,
      pausedAt: feed.pausedAt,
      name: feed.name,
      url: feed.url
    }
  }

  feedToRemote (feed) {
    return {
      url: feed.url,
      name: feed.name,
      updatedAt: feed.updatedAt,
      pausedAt: feed.pausedAt,
      unreads: this.queries.itemsForFeed(feed)
        .filter((item) => this.queries.isNotRead(item))
        .map((item) => item.guid)
    }
  }

  itemToLocal (item) {
    return {
      author: item.author,
      feedUrl: item.feedUrl,
      guid: item.guid,
      image: item.image,
      readAt: item.readAt,
      savedAt: item.savedAt,
      link: item.link,
      enclosure: item.enclosure,
      pubDate: item.pubDate,
      title: item.title,
      content: item.content,
      updatedAt: item.updatedAt
    }
  }

  itemToRemote (item) {
    return {
      author: item.author,
      feedUrl: item.feedUrl,
      guid: item.guid,
      image: item.image,
      readAt: item.readAt,
      savedAt: item.savedAt,
      link: item.link,
      enclosure: item.enclosure,
      pubDate: item.pubDate,
      title: item.title,
      content: item.content,
      updatedAt: item.updatedAt
    }
  }
}

export default Formatters
