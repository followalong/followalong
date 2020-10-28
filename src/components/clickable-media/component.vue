<template>
  <div class="clickable-media">
    <a
      href="javascript:;"
      class="expander"
      @click="app.popout(item, true)"
    >
      <font-awesome-icon icon="expand" />
    </a>
    <a
      v-if="!clicked"
      href="javascript:;"
      @click="clicked = true"
    >
      <img
        v-if="item.image && item.image.url"
        :src="item.image.url"
      >
      <a
        v-else
        href="javascript:;"
      >&#9658;</a>
    </a>
    <EmbedMedia
      v-else
      :item="item"
      :app="app"
      :autoplay="true"
    />
  </div>
</template>

<script>
import methods from '@/components/app/methods'
import EmbedMedia from '@/components/embed-media/component.vue'

export default {
  components: {
    EmbedMedia
  },
  props: ['app', 'item'],
  data () {
    return {
      autoplay: true,
      clicked: false
    }
  },
  methods
}
</script>
