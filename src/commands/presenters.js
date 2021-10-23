class Presenters {
  constructor (queries) {
    this.queries = queries
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

  itemToRemote (item) {
    return {
      author: item.author,
      feedUrl: item.feedUrl,
      guid: item.guid,
      image: this._buildObj(item.image),
      readAt: item.readAt,
      savedAt: item.savedAt,
      link: item.link,
      enclosure: this._buildObj(item.enclosure),
      pubDate: item.pubDate,
      title: item.title,
      content: item.content,
      updatedAt: item.updatedAt
    }
  }
}

export default Presenters
