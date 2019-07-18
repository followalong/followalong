<template>
  <div class="feeds">
    <button :class="'float-right ' + (app.loading ? 'loading' : '')" v-on:click="app.fetchAllFeeds(app.identity, true)">
      <span v-if="app.loading">Loading...</span>
      <span v-else>Fetch All Feeds</span>
    </button>

    <h1>Subscriptions</h1>

    <ul>
      <li
        is="feed"
        v-for="feed in app.feeds"
        :key="feed.url"
        :feed="feed"
        :app="app"
      ></li>
    </ul>
  </div>
</template>

<script>
import Feed from '@/components/feed/component.vue';

export default {
  name: 'subscriptions',
  props: ['app'],
  components: {
    Feed
  }
}
</script>
