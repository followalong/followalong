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

  saveForLater (item) {
    var _ = this

    item._updatedAt = Date.now()
    item.isSaved = !item.isSaved
    _.app.save(_.app.identity)
  }
}
