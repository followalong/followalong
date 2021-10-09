const VIDEO_TYPES = /\.(mp4)/
const AUDIO_TYPES = /\.(mp3|wav)/

export default {
  video (item, autoplay) {
    if (!item) {
      return undefined
    }

    if (item.guid && item.guid.slice(0, 9) === 'yt:video:') {
      return 'https://www.youtube.com/embed/' + item.guid.slice(9) + (autoplay ? '?&rel=0&modestbranding=1&playsinline=1&autoplay=1' : '')
    } else if (item.enclosure && VIDEO_TYPES.test(item.enclosure.url)) {
      return item.enclosure.url
    }
  },

  audio (item) {
    if (!item) {
      return undefined
    }

    if (item.link && AUDIO_TYPES.test(item.link)) {
      return item.link
    } else if (item.enclosure && AUDIO_TYPES.test(item.enclosure.url)) {
      return item.enclosure.url
    }
  }
}
