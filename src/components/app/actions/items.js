export default {
  saveForLater (item) {
    var _ = this

    item._updatedAt = Date.now()
    item.isSaved = !item.isSaved
    _.app.save(_.app.identity)
  }
}
