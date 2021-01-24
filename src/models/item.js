export default {
  props: {
    _updatedAt: {
      type: Date,
      default: ''
    },
    author: {
      type: String,
      default: ''
    },
    feedURL: {
      type: String,
      default: ''
    },
    guid: {
      type: String,
      default: ''
    },
    image: {
      type: Object,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false
    },
    isSaved: {
      type: Boolean,
      default: false
    },
    link: {
      type: String,
      default: ''
    },
    pubDate: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    feed: {
      type: Object,
      default () {
        return {}
      }
    },
    _mediaVerb: {
      type: String,
      default: ''
    }
  }
}
