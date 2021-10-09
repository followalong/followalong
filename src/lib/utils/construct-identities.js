export default function (app) {
  return new Promise((resolve, reject) => {
    app.keychain.restoreToMemory().then((keys) => {
      const identities = []

      for (const id in keys) {
        identities.push({ id: id })
      }

      resolve(identities)
    }).catch(reject)
  })
}
