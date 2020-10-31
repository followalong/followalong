<template>
  <div class="media-player">
    <div class="header">
      <h3>
        <router-link
          :to="{ name: 'item', params: { feed_url: playing.feed.url, guid: playing.guid } }"
          :title="playing.title"
        >
          {{ playing.title }}
        </router-link>
      </h3>

      <p>
        <router-link
          :to="{ name: 'feed', params: { feed_url: playing.feed.url } }"
          :title="playing.feed.name"
        >
          {{ playing.feed.name }}
        </router-link>
      </p>
    </div>
    <EmbedMedia
      :item="playing"
      :app="app"
      :autoplay="true"
      :expanded="true"
    />
  </div>
</template>

<script>
import EmbedMedia from '@/components/embed-media/component.vue'

export default {
  components: {
    EmbedMedia
  },
  props: ['app', 'playing']
}
</script>
