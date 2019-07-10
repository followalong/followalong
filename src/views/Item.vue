<template>
  <div v-if="item && item.feed" class="single-item">
    <EmbedMedia :item="item" :app="app" />

    <div class="feed">
      <h1>
        <a :href="item.link">{{item.title}}</a>
      </h1>

      <h3>
        <router-link :to="{ name: 'feed', params: { feed_url: item.feed.url } }" class="feed-name">
          <span v-if="item.author && item.author !== item.feed.name">
            {{item.author}} @
          </span>
          {{item.feed.name}}
        </router-link>

        &mdash;

        <span :title="item.pubDate" v-if="item.pubDate" class="feed-name">{{app.dateFormat(item.pubDate, app.now)}}</span>
      </h3>

      <div v-html="item.content" class="description"></div>

      <div style="margin-top: 20px;">
        <a :href="item.link" class="button" target="_blank">
          View Source
        </a>

        &nbsp;

        <a href="javascript:;" :class="'button' + (item.isSaved ? '' : ' button-gray')" v-on:click="app.saveForLater(item)">
          Save<span v-if="item.isSaved">d</span>
        </a>

        &nbsp;

        <a href="javascript:;" v-on:click="app.read(item)" class="button button-gray">
          Mark As <span v-if="item.isRead">Unread</span><span v-else>Read</span>
        </a>
      </div>
    </div>
    <div class="related-sidebar">
      <h2>Newsfeed</h2>
      <ul class="related">
        <li
          is="item"
          v-for="item in related"
          :key="item.guid"
          :item="item"
          :app="app"
        ></li>
      </ul>
    </div>
  </div>
</template>

<script>
import EmbedMedia from '@/components/embed-media/component.vue';
import Item       from '@/components/item/component.vue';

export default {
  props: ['app'],
  components: {
    Item,
    EmbedMedia
  },
  watch: {
    'item.guid' () {
      var _ = this;

      if (_.item) {
        _.app.read(_.item, true);
      }
    }
  },
  mounted() {
    var _ = this;

    if (_.item) {
      _.app.read(_.item, true);
    }
  },
  computed: {
    related() {
      var _ = this;

      return _.app.newsfeed.filter(function(i) {
        return i !== _.item;
      }).slice(0, 7);
    },

    item() {
      var _ = this;

      return (_.app.identity.items || []).find(function(item) {
        return item.guid + '' === _.$route.params.guid + '';
      });
    }
  }
};
</script>
