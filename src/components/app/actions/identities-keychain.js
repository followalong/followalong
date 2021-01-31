import crypt from '../crypt'
import utils from '../utils'
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

      if (identity.services.local.strategy === 'ask') {
        delete keychain[identity.id]
        state = crypt.de(keychain, store, identity, state)
      }

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

const getAskSecretKey = (keychain, store, identity, reset) => {
  if (reset) {
    delete keychain[identity.id]
  }

  if (!keychain[identity.id]) {
    keychain[identity.id] = prompt('What is your secret key?')

    if (keychain[identity.id] === null && reset) {
      identity.services.local.strategy = 'rotate'
      var key = utils.generateId()
      saveKey(keychain, store, identity, key, true)
      return key
    }
  }

  if (reset) {
    identity.save()
  }

  return keychain[identity.id]
}

const saveKey = (keychain, store, identity, key, ignoreSave) => {
  if (identity.services.local.strategy === 'ask') {
    delete keychain[identity.id]
    key = undefined
  }

  if (identity.services.local.strategy === 'store' && !key) {
    key = utils.generateId()
    keychain[identity.id] = key
  }

  if (key) {
    store.setItem('key-' + identity.id, key)
  } else {
    store.removeItem('key-' + identity.id)
  }

  if (!ignoreSave) {
    identity.save()
  }
}

export default {
  decryptIdentity,
  getAskSecretKey,
  saveKey
}
