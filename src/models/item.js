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
      type: Object,
      default () {
        return {}
      }
    }
  },
  computed: {
    mediaVerb () {
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
    }
  },
  methods: {
    read (val) {
      var current = this.isRead

      if (typeof val === 'undefined') {
        val = !this.isRead
      } else if (val === current) {
        return
      }

      this._updatedAt = Date.now()
      this.isRead = val
      this.save()
    },
    saveForLater () {
      this._updatedAt = Date.now()
      this.isSaved = !this.isSaved
      this.save()
    },
    save () {
      this.feed.save()
    }
  }
}
