import utils from '../utils'

export default {
  read (item, val) {
    var _ = this
    var current = item.isRead

    if (typeof val === 'undefined') {
      val = !item.isRead
    } else if (val === current) {
      return
    }

    item._updatedAt = Date.now()
    item.isRead = val

    _.app.save(_.app.identity)
  },

  blankifyLinks (str) {
    return utils.stripScriptsAndStyles(
      (str || '')
        .replace(/target=['"]?[^"']+['"\s>]?/g, '')
        .replace(/<a([^>]+)>?/g, '<a$1 target="_blank">')
    )
  },

  hasMedia (item) {
    return utils.getVideoSrc(item) || utils.getAudioSrc(item)
  },

  dateFormat (date, now) {
    return utils.timeAgo(new Date(date), now)
  },

  saveForLater (item) {
    var _ = this

    item._updatedAt = Date.now()
    item.isSaved = !item.isSaved

    _.app.save(_.app.identity)
  },

  setMediaVerb (item) {
    if (item._mediaVerb) {
      return item._mediaVerb
    }

    if (utils.getVideoSrc(item)) {
      item._mediaVerb = 'watch'
    } else if (utils.getAudioSrc(item)) {
      item._mediaVerb = 'listen'
    } else {
      item._mediaVerb = 'read'
    }

    return item._mediaVerb
  }
}
