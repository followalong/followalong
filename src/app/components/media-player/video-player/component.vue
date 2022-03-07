<template>
  <div
    v-if="src"
    class="video-embed"
  >
    <div class="aspect-ratio-box">
      <iframe
        :src="src"
        class="aspect-ratio-box-inside"
        frameborder="0"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </div>
  </div>
</template>

<script>
import { getVideoSrc } from '@/queries/helpers/get-src.js'

export default {
  props: ['item'],
  computed: {
    src () {
      return getVideoSrc(this.item, true)
    }
  }
}
</script>
