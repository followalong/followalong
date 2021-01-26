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
    }
  }
}
