export default (a, b) => {
  if (a._updatedAt < b._updatedAt) return -1
  if (a._updatedAt > b._updatedAt) return 1
  return 0
}
