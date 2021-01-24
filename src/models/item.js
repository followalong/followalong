import utils from '../components/app/utils'

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
      type: Object
    },
    _mediaVerb: {
      type: String,
      default: ''
    }
  },
  computed: {
    _mediaVerb () {
      if (utils.getVideoSrc(this)) {
        return 'watch'
      } else if (utils.getAudioSrc(this)) {
        return 'listen'
      } else {
        return 'read'
      }
    },
    hasMedia () {
      return utils.getVideoSrc(this) || utils.getAudioSrc(this)
    },
    prettyDate () {
      return utils.timeAgo(new Date(this.pubDate), new Date())
    }
  },
  methods: {
    save () {
      this.feed.save()
    }
  }
}
