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
    },
    identity: {
      type: 'BelongsTo'
    }
  },
  computed: {
    hasUnreadItems () {
      return this.items.value.filter((item) => !item.isRead).length
    }
  },
  methods: {
    save () {
      this.identity.value.save()
    },
    fetch (updatedAt, override, done) {
      updatedAt = updatedAt || Date.now()

      if (!override && this._updatedAt && this._updatedAt > updatedAt - utils.HALF_HOUR) {
        return done()
      }

      this.isLoading = true

      getFeed(this.identity.value, this.identity.value.findService('rss', true), this.identity.value.items, this, updatedAt, () => {
        this.isLoading = false

        if (typeof done === 'function') {
          done()
        }
      })
    }
  }
}
