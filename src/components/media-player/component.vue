<template>
  <div class="media-player">
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
