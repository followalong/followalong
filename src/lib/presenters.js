class Presenters {
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

  _buildObj (obj) {
    if (!obj) {
      return undefined
    }

    const data = {}

    for (const key in obj) {
      data[key] = obj[key]
    }

    return data
  }
}

export default Presenters
