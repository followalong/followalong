import SERVICES from '@/components/app/services'

export default {
  props: {
    name: {
      type: String,
      default: ''
    },
    services: {
      type: Object,
      default () {
        return {}
      }
    },
    hints: {
      type: Array,
      default () {
        return []
      }
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    _decrypted: {
      type: Boolean,
      default: false
    }
  },
  relationships: {
    feeds: {
      type: 'HasMany'
    }
  },
  methods: {
    findService (type, forceResult) {
      if (!this.services) {
        return
      }

      var service = this.services[type]

      if (!service && forceResult) {
        service = this.services[type] = { symlink: 'followalong-free' }
      }

      if (service && service.symlink) {
        service = SERVICES.concat(this.services.custom).find((s) => {
          return s.id === service.symlink
        })
      }

      if (service) {
        var template = SERVICES.find((s) => {
          return s.id === service.template
        })

        if (template) {
          var items = ['fields', 'pricing', 'description', 'request']

          for (var i = items.length - 1; i >= 0; i--) {
            service[items[i]] = service[items[i]] || template[items[i]]
          }
        }
      }

      return service
    },
    sync (data) {
      return new Promise((resolve, reject) => {
        const proxy = this.findService('sync')

        if (!proxy) {
          return resolve()
        }

        proxy.request(this, {
          action: 'sync',
          identity: data
        }, (err, result) => {
          if (err) {
            return reject(err)
          }

          resolve(result)
        })
      })
    },
    addFeed (feed) {
      feed.identityId = this.id

      if (feed.constructor.name === 'Instance') {
        feed.save()
      } else {
        feed = this.model.models.feed.create(feed)
      }

      return feed
    },
    save (done) {
      return new Promise((resolve, reject) => {
        this.saveLocal().then(() => {
          this.sync(this.toRemote()).then(() => {
            if (typeof done === 'function') {
              done()
            }

            resolve()
          }).catch(reject)
        })
      })
    }
  }
}
