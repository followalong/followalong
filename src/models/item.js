import utils from '../components/app/utils'

export default {
  props: {
    _updatedAt: {
      type: Number,
      default: 1
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
    enclosure: {
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
    content: {
      type: String,
      default: ''
    },
    _mediaVerb: {
      type: String,
      default: ''
    }
  },
  relationships: {
    feed: {
      type: 'BelongsTo',
      primaryKey: 'feedURL'
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
      this.feed.value.save()
    },
    toLocal () {
      return {
        author: this.author,
        feedURL: this.feedURL,
        guid: this.guid,
        image: this.image,
        isRead: this.isRead,
        isSaved: this.isSaved,
        link: this.link,
        enclosure: this.enclosure,
        pubDate: this.pubDate,
        title: this.title,
        content: this.content,
        _updatedAt: this._updatedAt
      }
    },
    toRemote () {
      return {
        author: this.author,
        feedURL: this.feedURL,
        guid: this.guid,
        image: this.image,
        isRead: this.isRead,
        isSaved: this.isSaved,
        link: this.link,
        enclosure: this.enclosure,
        pubDate: this.pubDate,
        title: this.title,
        content: this.content,
        _updatedAt: this._updatedAt
      }
    }
  }
}
