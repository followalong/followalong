export default function (HALF_HOUR) {
  return function (identity) {
    return HALF_HOUR / identity.feeds.length
  }
}
