export default function (FETCH_INTERVAL) {
  return function (identity) {
    return FETCH_INTERVAL / identity.feeds.length
  }
}
