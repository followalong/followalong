<template>
  <div :class="'embed-media ' + (isInline ? 'inline-player' : 'popout-player')">
    <div class="media-player">
      <div
        v-if="!isInline"
        class="title"
      >
        <a
          href="javascript:;"
          class="close"
          @click="app.stop()"
        >
          <font-awesome-icon
            icon="trash"
          />
        </a>

        <h3>
          <router-link
            :to="{ name: 'item', params: { feed_url: feed.url, guid: item.guid } }"
            :title="item.title"
          >
            {{ item.title }}
          </router-link>
        </h3>

        <p>
          <router-link
            :to="{ name: 'feed', params: { feed_url: feed.url } }"
            :title="feed.name"
          >
            {{ feed.name }}
          </router-link>
        </p>
      </div>

      <div
        class="player-wrapper"
      >
        <component
          :is="type + 'Player'"
          v-if="type"
          :item="item"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AudioPlayer from '@/app/components/media-player/audio-player/component.vue'
import MediaPreview from '@/app/components/media-player/media-preview/component.vue'
import VideoPlayer from '@/app/components/media-player/video-player/component.vue'
import { getAudioSrc, getVideoSrc } from '@/queries/helpers/get-src.js'

export default {
  components: {
    AudioPlayer,
    MediaPreview,
    VideoPlayer
  },
  props: ['app', 'item'],
  computed: {
    feed () {
      return this.app.queries.feedForItem(this.item)
    },

    type () {
      if (getVideoSrc(this.item, true)) {
        return 'Video'
      } else if (getAudioSrc(this.item, true)) {
        return 'Audio'
      } else {
        return ''
      }
    },

    isInline () {
      return this.$router.currentRoute.value.params.feed_url === this.feed.url && this.$router.currentRoute.value.params.guid === this.item.guid
    }
  }
}
</script>
