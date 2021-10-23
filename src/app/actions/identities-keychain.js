// import crypt from '@/lib/crypt'
//
// const decryptIdentity = function (keychain, store, identity) {
//   return new Promise((resolve, reject) => {
//     if (identity._decrypted) {
//       return resolve()
//     }
//
//     store.getItem(identity.id).then((state) => {
//       if (!state) {
//         identity._decrypted = true
//         return resolve()
//       }
//
//       state = crypt.de(keychain, identity, state)
//
//       if (!state) {
//         if (confirm('Unauthorized. Would you like to refresh this page?')) {
//           window.location.reload()
//           return reject(new Error('Unauthorized'))
//         } else {
//           document.body.innerHTML = ''
//           return reject(new Error('Unauthorized'))
//         }
//       }
//
//       // utils.copyAttrs(state, identity, ['name', 'services', 'hints'])
//
//       if (state.feeds) {
//         state.feeds.forEach((feed) => {
//           identity.addFeed(feed)
//         })
//       }
//
//       // identitiesActions.addItemsToIdentity(identity, state.items)
//
//       identity._decrypted = true
//
//       resolve()
//     }).catch(reject)
//   })
// }
//
// const saveToInMemoryKeychain = (keychain, identity, key) => {
//   keychain.saveKeyInMemory(identity.id, key)
// }
//
// const saveToInStoreKeychain = (keychain, store, identity, key) => {
//   return keychain.saveKeyInStore(identity.id, key)
// }
//
// const saveKey = (keychain, store, identity, key, ignoreSave) => {
//   if (identity.services.local.strategy === 'store' && !key) {
//     // key = utils.generateId()
//   }
//
//   saveToInMemoryKeychain(keychain, identity, key)
//   saveToInStoreKeychain(keychain, store, identity, key)
//
//   if (!ignoreSave) {
//     identity.save()
//   }
// }
//
// export default {
//   decryptIdentity,
//   saveToInMemoryKeychain,
//   saveToInStoreKeychain,
//   saveKey
// }
