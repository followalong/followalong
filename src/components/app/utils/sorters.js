export default {
  LAST_UPDATED (a, b) {
    if (a._updatedAt < b._updatedAt) return -1
    if (a._updatedAt > b._updatedAt) return 1
    return 0
  },

  NAME (a, b) {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  }
}
