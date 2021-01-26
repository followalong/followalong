import aes256 from 'aes256'
import utils from './utils'
import identitiesKeychain from '../../components/app/actions/identities-keychain.js'

export default {
  en (keychain, store, identity, json) {
    var key = keychain[identity.id]
    var encrypted = json

    encrypted = typeof json === 'string' ? json : JSON.stringify(json)

    if (identity.services.local.strategy === 'none') {
      return encrypted
    } else if (identity.services.local.strategy === 'rotate') {
      key = utils.generateId()
      identitiesKeychain.saveKey(keychain, store, identity, key, true)
    } else if (identity.services.local.strategy === 'ask') {
      key = identitiesKeychain.getAskSecretKey(keychain, store, identity, false)
    } else if (identity.services.local.strategy === 'store') {
      if (typeof keychain[identity.id] === 'undefined') {
        key = utils.generateId()
        identitiesKeychain.saveKey(keychain, store, identity, key, true)
      }
    }

    if (!key || !key.length) {
      return encrypted
    }

    encrypted = aes256.encrypt(key, encrypted)

    return encrypted
  },

  de (keychain, store, identity, str) {
    var key = keychain[identity.id]

    if (str && typeof str !== 'string') {
      return str
    } else if (typeof key === 'undefined') {
      try {
        str = JSON.parse(str)
      } catch (e) {
        try {
          key = identitiesKeychain.getAskSecretKey(keychain, store, identity)

          if (key !== null) {
            str = JSON.parse(aes256.decrypt(key, str))

            if (typeof str === 'object' && str.services.local.strategy === 'store') {
              identitiesKeychain.saveKey(keychain, store, identity, key, true)
              keychain[identity.id] = key
            }
          }
        } catch (e) {
          return false
        }
      }
    } else {
      try {
        str = JSON.parse(aes256.decrypt(key, str))
      } catch (e) { }
    }

    if (typeof str === 'object') {
      return str
    } else {
      return false
    }
  }
}
