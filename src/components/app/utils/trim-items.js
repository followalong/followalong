import sorter from '../sorter'

export default function (identity) {
  var limit = parseInt(identity.services.local.maxReadCount)
  var items = identity.items.filter(function (item) {
    return item.isRead && !item.isSaved && !item.isPlaying
  }).sort(sorter())
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
}
