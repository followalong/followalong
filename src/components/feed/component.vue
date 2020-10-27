<template>
  <li>
    <button v-on:click="fetch()" :class="feed.loading ? 'loading' : ''">
      <span v-if="feed.loading">Loading...</span>
      <span v-else>Fetch Now</span>
    </button>
    <button v-on:click="pause()" :class="feed.paused ? 'button-gray' : ''">
      <span v-if="feed.paused">&#10074;&#10074;</span>
      <span v-else>&#9658;</span>
    </button>
    <h2>
      <router-link :to="{ name: 'feed', params: { feed_url: feed.url } }">
        {{feed.name}}
      </router-link>
      <a href="javascript:;" class="hint remove" v-on:click="app.unsubscribe(feed)">
        Unsubscribe
      </a>
    </h2>
    <p v-if="feed.meta && feed.meta.description" class="description">{{feed.meta.description}}</p>
    <p v-if="feed.error" class="description red">{{feed.error}}</p>
    <p>
      <a :href="feed.url" class="hint">Source: {{feed.url}}</a>
    </p>
  </li>
</template>

<script>
import methods from '@/components/app/methods';

export default {
  props: ['app', 'feed'],
  methods: {
    save: methods.save,

    fetch() {
      var _ = this;

      _.app.fetchFeed(_.app.identity, _.feed, Date.now(), true, function() {
        _.app.save();
      });
    },

    pause() {
      var _ = this;

      _.feed._updatedAt = Date.now();
      _.feed.paused = !_.feed.paused;
      _.app.save();
    }
  }
};
</script>
