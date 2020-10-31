import async from 'no-async'

export default function (app, done) {
  var identities = []
  var keychain = {}

  app.store.keys(function (err, keys) {
    async.eachParallel(keys || [], function (id, next) {
      if (id === 'hints') {
        app.store.getItem(id, function (err, value) {
          if (typeof value === 'string') {
            value = JSON.parse(value || '')
          }

          app.hints = value
          next()
        })
      } else if (id.slice(0, 4) !== 'key-') {
        identities.push({ id: id })
        next()
      } else {
        app.store.getItem(id, function (err, value) {
          keychain[id.slice(4)] = value
          next()
        })
      }
    }, function () {
      done(identities, keychain)
    })
  })
}
