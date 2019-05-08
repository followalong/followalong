<template>
  <div :class="klass" v-if="videoSrc || audioSrc">
    <a href="javascript:;" class="popout" v-on:click="app.popout(item, true)">&micro;</a>

    <div v-if="videoSrc">
        <iframe :src="videoSrc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>

    <div v-else>
        <div v-if="audioSrc">
            <audio controls>
              <source :src="audioSrc" :autoplay="autoplay">
            </audio>
        </div>
    </div>
  </div>
</template>

<script>
import methods  from '@/components/app/methods';

export default {
  name: 'EmbedMedia',
  props: ['app', 'item', 'autoplay'],
  computed: {
    klass() {
      var _ = this,
        str = 'embed';

      if (_.videoSrc) str += ' video-embed';
      if (_.audioSrc) str += ' audio-embed';

      return str;
    },

    videoSrc: {
      get() {
        var _ = this,
          src = methods.videoSrc(_.item);

        if (src && _.autoplay) {
          src += '?&autoplay=1';
        }

        return src;
      },
      set() {}
    },

    audioSrc: {
      get() {
        return methods.audioSrc(this.item, this.autoplay);
      },
      set() {}
    },
  },
  methods
};
</script>
