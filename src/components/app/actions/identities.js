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

  sync (identity, done) {
    const proxy = this.app.findService(identity, 'sync')

    if (!proxy) {
      return
    }

    proxy.request(proxy.app, identity, {
      action: 'sync',
      identity: utils.mappers.IDENTITY_REMOTE(identity)
    }, done)
  },

  save (identity, done) {
    this.saveLocal(identity, () => {
      this.sync(identity, done)
    })
  },

  saveLocal (identity, done) {
    var _ = this

    utils.trimItems(identity)

    _.app.store.setItem(
      identity.id,
      crypt.en(
        _.app,
        identity,
        utils.mappers.IDENTITY_LOCAL(identity)
      )
    )

    if (typeof done === 'function') {
      done()
    }
  }
}
