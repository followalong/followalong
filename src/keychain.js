import localForage from 'localforage'

class Keychain {
  constructor (name) {
    this.old = localForage.createInstance({ name: 'commmunity' })
    this.db = localForage.createInstance({ name })
    this.keys = {}
  }

  restoreOld () {
    return this.old.iterate(async (value, id) => {
      if (id.slice(0, 4) === 'key-') {
        await this.old.removeItem(id)
        await this.saveKeyInStore(id.slice(4), value)
      }
    })
  }

  restoreToMemory () {
    return new Promise((resolve, reject) => {
      this.restoreOld()
        .then(() => {
          this.db
            .iterate(async (value, id) => {
              await this.saveKeyInMemory(id, value)
            })
            .then(() => resolve(this.keys))
            .catch(reject)
        })
        .catch(reject)
    })
  }

  buildIdentities () {
    return new Promise((resolve, reject) => {
      this.restoreToMemory().then((keys) => {
        const identities = []

        for (const id in keys) {
          identities.push({ id: id })
        }

        resolve(identities)
      }).catch(reject)
    })
  }

  getKey (id) {
    return this.keys[id]
  }

  getKeyInStore (id) {
    return this.db.getItem(id)
  }

  saveKey (id, value) {
    this.saveKeyInMemory(id, value)
    return this.saveKeyInStore(id, value)
  }

  saveKeyInMemory (id, value) {
    this.keys[id] = value
  }

  saveKeyInStore (id, value) {
    return this.db.setItem(id, value)
  }

  removeKey (id) {
    this.removeKeyInMemory(id)
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

export default new Keychain('followalong-keychain')
