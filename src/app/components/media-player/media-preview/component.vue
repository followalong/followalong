<template>
  <a
    v-if="app.queries.hasMedia(item)"
    href="javascript;"
    @click.prevent="playOrLink"
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
  </a>
</template>

<script>
import { getImageSrc } from '@/queries/helpers/get-src.js'

export default {
  props: ['app', 'item'],
  computed: {
    src () {
      return getImageSrc(this.item)
    },

    feed () {
      return this.app.queries.feedForItem(this.item)
    }
  },
  methods: {
    playOrLink () {
      if (this.app.queries.hasMedia(this.item)) {
        this.app.commands.toggleRead(this.app.identity, this.item, true)
        this.app.play(this.item)
      } else {
        return this.$router.push({ name: 'item', params: { feed_url: this.feed.url, guid: this.item.guid } })
      }
    }
  }
}
</script>
