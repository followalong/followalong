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
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </div>
  </div>
</template>

<script>
import utils from '@/components/app/utils'

export default {
  props: ['item'],
  computed: {
    src () {
      return utils.getVideoSrc(this.item, true)
    }
  }
}
</script>
