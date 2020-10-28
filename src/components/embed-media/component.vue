<template>
  <div
    v-if="videoSrc || audioSrc"
    :class="klass"
  >
    <a
      href="javascript:;"
      class="expander"
      @click="app.popout(item, true)"
    >
      <font-awesome-icon
        v-if="expanded"
        icon="compress"
      />
      <font-awesome-icon
        v-else
        icon="expand"
      />
    </a>

    <div v-if="videoSrc">
      <iframe
        :src="videoSrc"
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </div>

    <div v-else>
      <div v-if="audioSrc">
        <audio
          controls
          :autoplay="autoplay"
        >
          <source :src="audioSrc">
        </audio>
      </div>
    </div>
  </div>
</template>

<script>
import methods from '@/components/app/methods'

export default {
  props: ['app', 'item', 'autoplay', 'expanded'],
  computed: {
    klass () {
      var _ = this
      var str = 'embed'

      if (_.videoSrc) str += ' video-embed'
      if (_.audioSrc) str += ' audio-embed'

      return str
    },

    videoSrc: {
      get () {
        return methods.videoSrc(this.item, this.autoplay)
      },
      set () {}
    },

    audioSrc: {
      get () {
        return methods.audioSrc(this.item, this.autoplay)
      },
      set () {}
    }
  },
  mounted () {
    this.item.isPlaying = true
  },
  beforeUnmount () {
    delete this.item.isPlaying
  },
  methods
}
</script>
