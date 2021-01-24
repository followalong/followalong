import crypt from '../crypt'
import utils from '../utils'
import SERVICES from '@/components/app/services'

export default {
  findService (identity, type, forceResult) {
    if (!identity || !identity.services) {
      return
    }

    var _ = this
    var service = identity.services[type]

    if (!service && forceResult) {
      service = identity.services[type] = { symlink: 'followalong-free' }
    }

    if (service && service.symlink) {
      service = SERVICES.concat(identity.services.custom).find(function (s) {
        return s.id === service.symlink
      })
    }

    if (service) {
      var template = SERVICES.find(function (s) {
        return s.id === service.template
      })

      if (template) {
        var items = ['fields', 'pricing', 'description', 'request']

        for (var i = items.length - 1; i >= 0; i--) {
          service[items[i]] = service[items[i]] || template[items[i]]
        }
      }

      if (!service.app) {
        Object.defineProperty(service, 'app', {
          value: _.app,
          enumerable: false
        })
      }
    }

    return service
  },

  decryptIdentity (identity, done) {
    if (identity._decrypted) {
      return done()
    }

    this.store.getItem(identity.id, (err, state) => {
      if (!state) {
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

      utils.copyAttrs(state, identity, ['name', 'local', 'items', 'feeds', 'services'])

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
        _.app.saveKey(identity, key, true)
        return key
      }
    }

    if (reset) {
      _.app.save()
    }

    return _.app.keychain[identity.id]
  },

  saveKey (identity, key, ignoreSave) {
    var _ = this

    if (identity.services.local.strategy === 'ask') {
      delete _.app.keychain[identity.id]
      key = undefined
    }

    if (identity.services.local.strategy === 'store' && !key) {
      key = utils.generateId()
      _.app.keychain[identity.id] = key
    }

    if (key) {
      _.store.setItem('key-' + identity.id, key)
    } else {
      _.store.removeItem('key-' + identity.id)
    }

    if (!ignoreSave) {
      _.app.save()
    }
  },

  sync (done) {
    const proxy = this.app.findService(this.app.identity, 'sync')

    if (!proxy) {
      return
    }

    proxy.request(proxy.app, proxy.app.identity, {
      action: 'sync',
      identity: utils.mappers.IDENTITY_REMOTE(this.app.identity)
    }, done)
  },

  save (done) {
    this.saveLocal(() => {
      this.sync(done)
    })
  },

  saveLocal (done) {
    var _ = this

    utils.trimItems(_.app.identity)

    _.app.store.setItem(
      _.app.identity.id,
      crypt.en(
        _.app,
        _.app.identity,
        utils.mappers.IDENTITY_LOCAL(_.app.identity)
      )
    )

    if (typeof done === 'function') {
      done()
    }
  }
}
