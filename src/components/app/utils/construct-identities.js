import async from 'no-async'

export default function (app) {
  return new Promise((resolve) => {
    var identities = []
    var keychain = {}

    app.store.keys(function (err, keys) {
      async.eachParallel(keys || [], function (id, next) {
        if (id.slice(0, 4) !== 'key-') {
          identities.push({ id: id })
          next()
        } else {
          app.store.getItem(id, function (err, value) {
            keychain[id.slice(4)] = value
            next()
          })
        }
      }, function () {
        resolve(identities, keychain)
      })
    })
  })
}
