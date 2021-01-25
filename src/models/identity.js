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
  }
}
