import localForage from 'localforage'

class KeychainAdapter {
  constructor (options) {
    this.db = localForage.createInstance({ name: 'keychain' })
    this.keys = {}

    for (const key in options) {
      this[key] = options[key]
    }
  }

  add (encryptionStrategy, id) {
    const functions = {
      ask: 'addAsk',
      none: 'addNone',
      rotate: 'addRotate',
      store: 'addStore'
    }

    return this[functions[encryptionStrategy]](id)
  }

  addAsk (id) {
    return new Promise((resolve, reject) => {
      const key = this.prompt('What is the password?')

      if (key === null) {
        return reject(new Error('No key supplied.'))
      }

      this.saveKeyInMemory(id, key)

      resolve()
    })
  }

  addNone (id) {
    return new Promise((resolve, reject) => {
      this.removeKeyInStore(id).then(() => {
        this.removeKeyInMemory(id)
        resolve()
      }).catch(reject)
    })
  }

  addRotate (id) {
    return new Promise((resolve, reject) => {
      resolve()
    })
  }

  getKey (id) {
    return this.keys[id]
  }

  saveKeyInMemory (id, value) {
    this.keys[id] = value
  }

  saveKeyInStore (id, value) {
    return this.db.setItem(id, value)
  }

  removeKeyInStore (id) {
    return this.db.removeItem(id)
  }

  removeKeyInMemory (id) {
    delete this.keys[id]
  }

  clear () {
    this.keys = {}
    return this.db.clear()
  }
}

export default KeychainAdapter
