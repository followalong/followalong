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
    <MediaPlayer
      :item="playing"
      :app="app"
      :autoplay="true"
      :expanded="true"
    />
  </div>
</template>

<script>
import MediaPlayer from '@/app/components/media-player/component.vue'

export default {
  components: {
    MediaPlayer
  },
  props: ['app', 'playing']
}
</script>
