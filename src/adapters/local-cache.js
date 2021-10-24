import localForage from 'localforage'

class LocalCacheAdapter {
  constructor () {
    this.db = localForage.createInstance({
      name: 'followalong-v1'
    })
  }

  saveIdentity (identityData, encrypt) {
    return this.db.setItem(
      identityData.id,
      encrypt(this._identityFormat(identityData))
    )
  }

  getIdentity (id) {
    return this.db.getItem(id)
  }

  getIdentityIds () {
    return this.db.keys()
  }

  removeIdentity (id) {
    return this.db.removeItem(id)
  }

  reset () {
    return this.db.clear()
  }

  getSize (identityData) {
    let size = JSON.stringify(this._identityFormat(identityData)).length
    let unit = 'b'

    if (size > 1000000) {
      size = size / 1000000
      unit = 'mb'
    } else if (size > 1000) {
      size = size / 1000
      unit = 'kb'
    }

    return '~' + (Math.round(size * 10) / 10) + ' ' + unit
  }

  _identityFormat (identityData) {
    const services = identityData.services || {}

    return {
      id: identityData.id,
      name: identityData.name,
      hints: identityData.hints,
      feeds: identityData.feeds.map((feed) => {
        return {
          updatedAt: feed.updatedAt,
          pausedAt: feed.pausedAt,
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
        local: this._buildObj(services.local || {})
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

export default LocalCacheAdapter
