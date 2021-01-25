
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
    }
  }
}
