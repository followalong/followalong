import crypt from '../crypt'
import utils from '@/components/app/utils/index.js'
import identitiesActions from '../actions/identities.js'

const decryptIdentity = function (keychain, store, identity) {
  return new Promise((resolve, reject) => {
    if (identity._decrypted) {
      return resolve()
    }

    store.getItem(identity.id).then((state) => {
      if (!state) {
        identity._decrypted = true
        return resolve()
      }

      state = crypt.de(keychain, store, identity, state)

      if (!state) {
        if (confirm('Unauthorized. Would you like to refresh this page?')) {
          window.location.reload()
        } else {
          document.body.innerHTML = ''
        }

        return resolve()
      }

      utils.copyAttrs(state, identity, ['name', 'services', 'hints'])

      state.feeds.forEach((feed) => {
        identity.addFeed(feed)
      })

      identitiesActions.addItemsToIdentity(identity, state.items)

      identity._decrypted = true

      resolve()
    }).catch(reject)
  })
}

const saveToInMemoryKeychain = (keychain, identity, key) => {
  keychain.saveKeyInMemory(identity.id, key)
}

const saveToInStoreKeychain = (keychain, store, identity, key) => {
  if (key) {
    return keychain.saveKeyInStore(identity.id, key)
  } else {
    return keychain.removeKey(identity.id)
  }
}

const saveKey = (keychain, store, identity, key, ignoreSave) => {
  if (identity.services.local.strategy === 'store' && !key) {
    key = utils.generateId()
  }

  saveToInMemoryKeychain(keychain, identity, key)
  saveToInStoreKeychain(keychain, store, identity, key)

  if (!ignoreSave) {
    identity.save()
  }
}

export default {
  decryptIdentity,
  saveToInMemoryKeychain,
  saveToInStoreKeychain,
  saveKey
}
