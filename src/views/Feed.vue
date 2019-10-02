<template>
  <div v-if="feed">
    <div class="feed wide-feed">

      <div class="float-right">
        <button v-on:click="pause()" :class="(feed.paused ? 'button-gray' : '') + ' button-small'">
          <span v-if="feed.paused">&#10074;&#10074;</span>
          <span v-else>&#9658;</span>
        </button> &nbsp;
        <button v-if="unreadItems.length" v-on:click="catchFeedUp()" class="button-gray button-small">Catch Me Up!</button> &nbsp;
        <button v-on:click="fetch()" :class="(feed.loading ? 'loading' : '') + ' button-small'">
          <span v-if="feed.loading">Loading...</span>
          <span v-else>Fetch Now</span>
        </button>
      </div>

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
        return item.feedURL === _.feed.url;
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
    },

    pause() {
      var _ = this;

      _.feed._updatedAt = Date.now();
      _.feed.paused = !_.feed.paused;
      _.app.save();
    },

    fetch() {
      var _ = this;

      _.app.fetchFeed(_.app.identity, _.feed, Date.now(), true, function() {
        _.app.save();
      });
    }
  }
};
</script>
