<template>
  <div class="clickable-media" v-if="item.image && item.image.url">
    <a href="javascript:;" class="popout" v-on:click="app.popout(item); app.read(item, true)">&micro;</a>
    <EmbedMedia v-if="clicked" :item="item" :app="app" :autoplay="!item.isRead" />
    <a href="javascript:;" v-else v-on:click="clicked = true">
      <img :src="item.image.url">
    </a>
  </div>
</template>

<script>
import methods  from '@/components/app/methods';
import EmbedMedia from '@/components/embed-media/component.vue';

export default {
  name: 'ClickableMedia',
  props: ['app', 'item'],
  components: {
    EmbedMedia
  },
  data() {
    return {
      autoplay: true,
      clicked: false
    };
  },
  methods
};
</script>
