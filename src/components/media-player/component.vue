<template>
  <div class="media-player">
    <div class="header">
        <h3>
            <router-link :to="{ name: 'item', params: { feed_url: playing.feed.url, guid: playing.guid } }" :title="playing.title">
                {{playing.title}}
            </router-link>
        </h3>

        <p>
            <router-link :to="{ name: 'feed', params: { feed_url: playing.feed.url } }" :title="playing.feed.name">
                {{playing.feed.name}}
            </router-link>
        </p>
    </div>
    <EmbedMedia :item="playing" :app="app" :autoplay="true" />
  </div>
</template>

<script>
import methods  from '@/components/app/methods';
import EmbedMedia from '@/components/embed-media/component.vue';

export default {
  name: 'MediaPlayer',
  components: {
    EmbedMedia
  },
  props: ['app', 'playing'],
  methods
};
</script>
