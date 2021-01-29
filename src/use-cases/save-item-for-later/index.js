export default function (item, val) {
  var current = item.isSaved

  if (typeof val === 'undefined') {
    val = !current
  } else if (val === current) {
    return
  }

  item._updatedAt = Date.now()
  item.isSaved = val
  item.save()
}
