<template>
  <div class="embed-media">
    <div class="relativizer">
      <a
        href="javascript:;"
        class="expander"
        @click="popout(item)"
      >
        <font-awesome-icon
          icon="expand"
        />
      </a>
    </div>

    <div v-if="type">
      <a
        v-if="!clicked"
        href="javascript:;"
        @click="clicked = true"
      >
        <MediaPreview :item="item" />
      </a>

      <component
        :is="type + 'Player'"
        v-else-if="type"
        :item="item"
      />
    </div>
  </div>
</template>

<script>
import utils from '@/components/app/utils'
import markAsRead from '@/commands/items/mark-as-read.js'
import AudioPlayer from '@/components/media-player/audio-player/component.vue'
import MediaPreview from '@/components/media-player/media-preview/component.vue'
import VideoPlayer from '@/components/media-player/video-player/component.vue'

export default {
  components: {
    AudioPlayer,
    MediaPreview,
    VideoPlayer
  },
  props: ['app', 'item', 'autoplay'],
  data () {
    return {
      clicked: this.autoplay || false,
      expanded: false
    }
  },
  computed: {
    type () {
      if (utils.getVideoSrc(this.item, true)) {
        return 'Video'
      } else if (utils.getAudioSrc(this.item, true)) {
        return 'Audio'
      } else {
        return ''
      }
    }
  },
  methods: {
    popout (item) {
      if (this.app.playing === item) {
        this.app.playing = undefined
      } else {
        markAsRead(item, true)
        this.app.playing = item
      }
    }
  }
}
</script>
