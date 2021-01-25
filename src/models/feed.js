import utils from '../components/app/utils'
import { getFeed } from '@/components/app/fetcher'

export default {
  primaryKey: 'url',
  props: {
    _updatedAt: {
      type: Number,
      default () {
        return Date.now()
      }
    },
    loading: {
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
    }
  },
  relationships: {
    items: {
      type: 'HasMany',
      foreignModel: 'item',
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

      this.loading = true

      getFeed(app.findService(this.identity, 'rss', true), this.identity.items, this, updatedAt, () => {
        this.loading = false

        if (typeof done === 'function') {
          done()
        }
      })
    }
  }
}
