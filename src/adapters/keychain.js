import localForage from 'localforage'

class KeychainAdapter {
  constructor (options) {
    this.db = localForage.createInstance({ name: 'followalong-keychain-v1' })
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
      this._askForKey().then((key) => {
        this._saveKeyInStore(id, 'ask')
          .then(() => {
            this._saveKeyInMemory(id, key)
            resolve()
          })
          .catch(reject)
      }).catch(reject)
    })
  }

  addNone (id) {
    return new Promise((resolve, reject) => {
      this._removeKeyInStore(id).then(() => {
        this._removeKeyInMemory(id)
        resolve()
      }).catch(reject)
    })
  }

  addRotate (id) {
    return new Promise((resolve, reject) => {
      resolve()
    })
  }

  _askForKey () {
    return new Promise((resolve, reject) => {
      const key = this.prompt.apply(window, ['What is the password?'])

      if (key === null) {
        return reject(new Error('No key supplied.'))
      }

      resolve(key)
    })
  }

  getKey (id) {
    return new Promise((resolve, reject) => {
      this.db.getItem(id)
        .then((key) => {
          if (key === 'ask') {
            if (this.keys[id]) {
              return resolve(this.keys[id])
            }

            this._askForKey().then((key) => {
              this._saveKeyInMemory(id, key)
              resolve(key)
            }).catch(reject)
          } else if (this.keys[id] || key) {
            resolve(this.keys[id] || key)
          } else {
            resolve()
          }
        })
        .catch(reject)
    })
  }

  _saveKeyInMemory (id, value) {
    this.keys[id] = value
  }

  _saveKeyInStore (id, value) {
    return this.db.setItem(id, value)
  }

  _removeKeyInStore (id) {
    return this.db.removeItem(id)
  }

  _removeKeyInMemory (id) {
    delete this.keys[id]
  }

  clear () {
    this.keys = {}
    return this.db.clear()
  }
}

export default KeychainAdapter
