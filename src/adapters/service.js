class ServiceAdapter {
  constructor (adapterOptions, serviceData) {
    this.data = serviceData || {}

    for (const key in adapterOptions) {
      this[key] = adapterOptions[key]
    }
  }

  get () {
    return Promise.reject(new Error('`Get` is not supported by this service.'))
  }

  save () {
    return Promise.reject(new Error('`Save` is not supported by this service.'))
  }

  destroy () {
    return Promise.reject(new Error('`Destroy` is not supported by this service.'))
  }

  rss () {
    return Promise.reject(new Error('`RSS` is not supported by this service.'))
  }

  search () {
    return Promise.reject(new Error('`Search` is not supported by this service.'))
  }

  format (identityData) {
    const services = identityData.services || {}

    return {
      id: identityData.id,
      name: identityData.name,
      hints: Object.assign([], identityData.hints || []),
      feeds: identityData.feeds.map((feed) => {
        return {
          updatedAt: feed.updatedAt,
          pausedAt: feed.pausedAt,
          latestInteractionAt: feed.latestInteractionAt,
          name: feed.name,
          url: feed.url
        }
      }),
      items: identityData.items.map((item) => {
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
      }),
      services: {
        local: this._buildObj(services.local || {}),
        rss: this._buildObj(services.rss || {}),
        search: this._buildObj(services.search || {})
      }
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

export default ServiceAdapter
