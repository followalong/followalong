<template>
  <router-link
    v-if="app.queries.hasMedia(item)"
    :to="{ name: 'item', params: { feed_url: feed.url, guid: item.guid } }"
  >
    <img
      v-if="src"
      :src="src"
      class="img-preview"
    >
    <span
      v-else
      href="javascript:;"
    >&#9658;</span>
  </router-link>
</template>

<script>
import utils from '@/lib/utils/index.js'

export default {
  props: ['app', 'item'],
  computed: {
    src () {
      return utils.getImageSrc(this.item)
    },

    feed () {
      return this.app.queries.feedForItem(this.item)
    }
  }
}
</script>
