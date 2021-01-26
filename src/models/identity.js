import SERVICES from '@/components/app/services'
import utils from '@/components/app/utils/index.js'

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
    _decrypted: {
      type: Boolean,
      default: false
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
        service = SERVICES.concat(this.services.custom).find(function (s) {
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
      }

      return service
    },
    sync (done) {
      const proxy = this.findService('sync')

      if (!proxy) {
        return
      }

      proxy.request(this, {
        action: 'sync',
        identity: utils.mappers.IDENTITY_REMOTE(this)
      }, function (err, data) {
        if (typeof done === 'function') {
          done(err, data)
        }
      })
    },
    addFeed (feed) {
      feed.identity = this

      if (feed.constructor.name === 'Instance') {
        feed.save()
      } else {
        feed = this.model.models.feed.create(feed)
      }

      this.feeds.push(feed)

      return feed
    }
  }
}
