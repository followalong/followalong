import aes256 from 'aes256'
import identitiesKeychain from '../../components/app/actions/identities-keychain.js'

export default {
  en (keychain, store, identity, json) {
    const key = keychain.getKey(identity.id)
    const str = typeof json === 'string' ? json : JSON.stringify(json)

    if (key === 'none' || !key) {
      return str
    }

    return aes256.encrypt(key, str)
  },

  de (keychain, store, identity, str) {
    var key = keychain.getKey(identity.id)

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
      } catch (e) { }
    } else if (key) {
      try {
        str = JSON.parse(aes256.decrypt(key, str))
      } catch (e) { }
    }

    try { str = JSON.parse(str) } catch (e) { }

    if (typeof str !== 'object') {
      return false
    }

    return str
  }
}
