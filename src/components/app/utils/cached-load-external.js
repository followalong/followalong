import loadExternal from 'load-external'

const srcCache = {}

export default function (url, done) {
  if (srcCache[url]) {
    return done()
  }

  srcCache[url] = true

  loadExternal(url, done)
}
