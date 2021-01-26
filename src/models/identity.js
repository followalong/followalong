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
    }
  }
}
