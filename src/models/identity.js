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
    sync (done) {
      const proxy = this.findService('sync')

      if (!proxy) {
        return done('No sync service configured.')
      }

      proxy.request(this, {
        action: 'sync',
        identity: this.toRemote()
      }, (err, data) => {
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
    },
    toLocal () {
      return {
        id: this.id,
        name: this.name,
        hints: this.hints,
        feeds: this.feeds.map((feed) => feed.toLocal()),
        items: this.items.map((item) => item.toLocal()),
        services: this.services
      }
    },
    toRemote () {
      return {
        id: this.id,
        name: this.name,
        hints: this.hints,
        feeds: this.feeds.map((feed) => feed.toRemote()),
        items: this.items.filter((item) => item.isSaved).map((item) => item.toRemote()),
        services: this.services
      }
    }
  }
}
