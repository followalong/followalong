import async from 'no-async'

export default function (app) {
  return new Promise((resolve, reject) => {
    var identities = []
    var keychain = {}

    app.store.keys().then((keys) => {
      async.eachParallel(keys || [], function (id, next) {
        if (id.slice(0, 4) === 'key-') {
          app.store.getItem(id, function (err, value) {
            keychain[id.slice(4)] = value
            next()
          })
        } else {
          identities.push({ id: id })
          next()
        }
      }, function () {
        resolve({ identities, keychain })
      })
    }).catch(reject)
  })
}
