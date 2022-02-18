<template>
  <div
    v-if="src"
    class="audio-embed"
  >
    <audio
      ref="audio"
      controls
      autoplay
    >
      <source :src="src">
    </audio>
  </div>
</template>

<script>
import NoSleep from 'nosleep.js'
import { getAudioSrc } from '@/queries/helpers/get-src.js'

const noSleep = new NoSleep()

export default {
  props: ['item'],
  computed: {
    src () {
      return getAudioSrc(this.item, true)
    }
  },
  watch: {
    src () {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
    }
  },
  mounted () {
    noSleep.enable()
  },
  unmounted () {
    noSleep.disable()
  }
}
</script>
