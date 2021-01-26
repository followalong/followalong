import crypt from '../crypt'
import utils from '../utils'

export default {
  decryptIdentity (identity, done) {
    if (identity._decrypted) {
      return done()
    }

    this.store.getItem(identity.id, (err, state) => {
      if (!state) {
        identity._decrypted = true
        return done()
      }

      state = crypt.de(this.app, identity, state)

      if (identity.services.local.strategy === 'ask') {
        delete this.app.keychain[identity.id]
        state = crypt.de(this.app, identity, state)
      }

      if (!state) {
        if (confirm('Unauthorized. Would you like to refresh this page?')) {
          window.location.reload()
        } else {
          document.body.innerHTML = ''
        }

        return
      }

      utils.copyAttrs(state, identity, ['name', 'services', 'hints'])

      state.feeds.forEach((feed) => {
        this.app.addFeedToIdentity(identity, feed)
      })

      this.app.addItemsToIdentity(identity, undefined, state.items)

      identity._decrypted = true

      done()
    })
  },

  getAskSecretKey (identity, reset) {
    var _ = this

    if (reset) {
      delete _.app.keychain[identity.id]
    }

    if (!_.app.keychain[identity.id]) {
      _.app.keychain[identity.id] = prompt('What is your secret key?')

      if (_.app.keychain[identity.id] === null && reset) {
        identity.services.local.strategy = 'rotate'
        var key = utils.generateId()
        _.app.saveKey(_.app.keychain, _.app.store, identity, key, true)
        return key
      }
    }

    if (reset) {
      identity.save()
    }

    return _.app.keychain[identity.id]
  },

  saveKey (keychain, store, identity, key, ignoreSave) {
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
}
