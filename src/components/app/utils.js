import sorter from '@/components/app/sorter'

const TWO_MINUTES = 1000 * 60 * 1
const HALF_HOUR = 1000 * 60 * 60 * 0.5
const BASE64_CHARACTERS = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/

export default {
  TWO_MINUTES,
  HALF_HOUR,

  feedFetcherDuration (identity) {
    return HALF_HOUR / identity.feeds.length
  },

  trimItems (identity) {
    var limit = parseInt(identity.services.local.maxReadCount)
    var items = identity.items.filter(function (item) {
      return item.isRead && !item.isSaved && !item.isPlaying
    }).sort(sorter(identity))
    var itemsLength = items.length
    var item; var i

    for (i = itemsLength - 1; i >= 0; i--) {
      if (itemsLength <= limit) {
        break
      }

      item = items[i]

      if (!item) continue

      identity.items.splice(identity.items.indexOf(item), 1)
      itemsLength--
    }
  },

  isBase64 (str) {
    return BASE64_CHARACTERS.test(str)
  }
}
