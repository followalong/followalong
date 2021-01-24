export default function (item, val) {
  var current = item.isRead

  if (typeof val === 'undefined') {
    val = !current
  } else if (val === current) {
    return
  }

  item._updatedAt = Date.now()
  item.isRead = val
  item.save()
}
