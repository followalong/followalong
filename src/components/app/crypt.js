import aes256 from 'aes256'
import utils from './utils'
import identitiesKeychain from '../../components/app/actions/identities-keychain.js'

export default {
  en (keychain, store, identity, json) {
    const key = keychain[identity.id]
    const str = typeof json === 'string' ? json : JSON.stringify(json)

    if (key === 'none' || !key) {
      return str
    }

    return aes256.encrypt(key, str)
  },

  de (keychain, store, identity, str) {
    var key = keychain[identity.id]

    if (typeof str === 'object') {
      return str
    } else if (key === 'ask') {
      key = prompt('What is your secret key?')

      if (key === null) {
        return false
      }

      try {
        str = JSON.parse(aes256.decrypt(key, str))
        identitiesKeychain.saveToInMemoryKeychain(keychain, identity, key)
      } catch (e) {
        str = JSON.parse(str)
      }
    } else {
      try {
        str = JSON.parse(aes256.decrypt(key, str))
      } catch (e) {
        str = JSON.parse(str)
      }
    }

    if (typeof str !== 'object') {
      return false
    }

    return str
  }
}
