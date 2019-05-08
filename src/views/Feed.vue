<template>
  <div v-if="feed">
    <div class="feed wide-feed">
      <button v-if="unreadItems.length" v-on:click="catchFeedUp()" class="button-gray button-small float-right">Catch Me Up!</button>
      <h1><a :href="feed.url">{{feed.name}}</a></h1>
      <ul class="items">
        <li v-if="items.length === 0">
          <h3>You're all caught up!</h3>
          <p>
            If you want to be able to see more "history", visit the <router-link to="/settings" class="link">Settings</router-link> page and increase the maximum number of items to keep.
          </p>
        </li>
        <li
          is="item"
          v-for="item in items"
          :key="item.guid"
          :item="item"
          :app="app"
          showContent="true"
        ></li>
      </ul>
    </div>
  </div>
</template>

<script>
import Item      from '@/components/item/component.vue';
import sorter    from '@/components/app/sorter';

export default {
  name: 'feed',
  props: ['app'],
  components: {
    Item
  },
  computed: {
    feed() {
      var _ = this;

      if (!_.app.identity.feeds) return;

      return _.app.identity.feeds.find(function(feed) {
          return feed.url + '' === _.$route.params.feed_url + '';
      });
    },
    unreadItems() {
      var _ = this;

      return _.items.filter(function(item) {
        return !item.isRead;
      });
    },
    items() {
      var _ = this;

      return (_.app.newsfeed || []).filter(function(item) {
        return item.feedId === _.feed.id;
      }).sort(sorter(_.app.identity));
    }
  },
  methods: {
    catchFeedUp() {
      var _ = this;

      for (var i = _.items.length - 1; i >= 0; i--) {
        _.items[i].isRead = true;
      }

      _.app.save();
    }
  }
};
</script>
