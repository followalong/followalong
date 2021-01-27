import utils from '../components/app/utils'
import { getFeed } from '@/components/app/fetcher'

export default {
  primaryKey: 'url',
  props: {
    _updatedAt: {
      type: Number,
      default: 1
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    paused: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      default: ''
    },
    unreads: {
      type: Array,
      default () {
        return []
      }
    }
  },
  relationships: {
    items: {
      type: 'HasMany',
      foreignKey: 'feedURL'
    }
  },
  computed: {
    hasUnreadItems () {
      return this.items.value.filter((item) => !item.isRead).length
    }
  },
  methods: {
    save () {
      this.identity.save()
    },
    fetch (app, updatedAt, override, done) {
      updatedAt = updatedAt || Date.now()

      if (!override && this._updatedAt && this._updatedAt > updatedAt - utils.HALF_HOUR) {
        return done()
      }

      this.isLoading = true

      getFeed(app.identity, this.identity.findService('rss', true), this.identity.items, this, updatedAt, () => {
        this.isLoading = false

        if (typeof done === 'function') {
          done()
        }
      })
    },
    toLocal () {
      return {
        _updatedAt: this._updatedAt,
        paused: this.paused,
        name: this.name,
        url: this.url
      }
    },
    toRemote () {
      return {
        url: this.url,
        name: this.name,
        _updatedAt: this._updatedAt,
        paused: this.paused,
        unreads: this.items.value.filter((item) => !item.isRead).map((item) => item.guid)
      }
    }
  }
}
