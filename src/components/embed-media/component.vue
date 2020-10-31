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

    <div
      class="aspect-ratio-box"
    >
      <a
        v-if="!clicked"
        href="javascript:;"
        @click="clicked = true"
      >
        <img
          v-if="item.image && item.image.url"
          class="aspect-ratio-box-inside"
          :style="'background-image:url(' + item.image.url + ')'"
        >
        <span
          v-else
          href="javascript:;"
        >&#9658;</span>
      </a>

      <div v-else>
        <div
          v-if="videoSrc"
          class="video-embed"
        >
          <iframe
            :src="videoSrc"
            class="aspect-ratio-box-inside"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
        </div>

        <div
          v-if="audioSrc"
          class="audio-embed"
        >
          <audio
            controls
            :autoplay="true"
          >
            <source :src="audioSrc">
          </audio>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import methods from '@/components/app/methods'
import utils from '@/components/app/utils'

export default {
  props: ['app', 'item', 'autoplay'],
  data () {
    return {
      clicked: this.autoplay || false,
      expanded: false
    }
  },
  computed: {
    videoSrc () {
      return utils.getVideoSrc(this.item, true)
    },

    audioSrc () {
      return utils.getAudioSrc(this.item, true)
    }
  },
  methods: {
    popout (item) {
      if (this.app.playing === item) {
        this.app.playing = undefined
      } else {
        this.app.read(item, true)
        this.app.playing = item
      }
    }
  }
}
</script>
