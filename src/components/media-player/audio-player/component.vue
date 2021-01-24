<template>
  <div
    v-if="src"
    class="audio-embed"
  >
    <audio
      controls
      :autoplay="true"
    >
      <source :src="src">
    </audio>
  </div>
</template>

<script>
import utils from '@/components/app/utils'

export default {
  props: ['item'],
  computed: {
    src () {
      return utils.getAudioSrc(this.item, true)
    }
  }
}
</script>
