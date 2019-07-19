<template>
  <div class="clickable-media">
    <a href="javascript:;" class="expander" v-on:click="app.popout(item, true)">
      <font-awesome-icon icon="expand" />
    </a>
    <a href="javascript:;" v-if="!clicked" v-on:click="clicked = true">
      <img v-if="item.image && item.image.url" :src="item.image.url">
      <a href="javascript:;" v-else>&#9658;</a>
    </a>
    <EmbedMedia v-else :item="item" :app="app" :autoplay="true" />
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
