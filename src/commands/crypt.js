import aes256 from 'aes256'
import identitiesKeychain from '@/components/app/actions/identities-keychain.js'

export default {
  en (keychain, identity, json) {
    const key = keychain.getKey(identity.id)
    const str = typeof json === 'string' ? json : JSON.stringify(json)

    if (key === 'none' || !key) {
      return str
    }

    return aes256.encrypt(key, str)
  },

  de (keychain, identity, str) {
    var key = keychain.getKey(identity.id)

    try {
      if (typeof str === 'object') {
        return str
      } else if (key === 'none' || str[0] === '{') {
        return JSON.parse(str)
      } else if (key === 'ask') {
        key = prompt('What is your secret key?')

        if (key === null) {
          return false
        }

        str = JSON.parse(aes256.decrypt(key, str))

        identitiesKeychain.saveToInMemoryKeychain(keychain, identity, key)

        return str
      } else if (key) {
        return JSON.parse(aes256.decrypt(key, str))
      }
    } catch (e) {
      return false
    }
  }
}
