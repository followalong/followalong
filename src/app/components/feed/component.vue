<template>
  <li>
    <button
      :class="app.queries.isFetching(feed) ? 'loading' : ''"
      :aria-label="`Fetch ${feed.name}`"
      @click="app.commands.fetchFeed(app.identity, feed)"
    >
      <span v-if="app.queries.isFetching(feed)">Loading...</span>
      <span v-else>Fetch Now</span>
    </button>
    <button
      :class="app.queries.isPaused(feed) ? 'button-gray' : ''"
      :aria-label="`${app.queries.isPaused(feed) ? 'Unpause' : 'Pause'}  ${feed.name}`"
      @click="app.commands.togglePause(app.identity, feed)"
    >
      <span v-if="app.queries.isPaused(feed)">&#10074;&#10074;</span>
      <span v-else>&#9658;</span>
    </button>
    <h2>
      <router-link
        :aria-label="`Visit ${feed.name}`"
        :to="{ name: 'feed', params: { feed_url: feed.url } }"
      >
        {{ feed.name }}
      </router-link>
      <a
        href="javascript:;"
        class="hint remove"
        :aria-label="`Unsubscribe ${feed.name}`"
        @click="app.commands.unsubscribeFeed(app.identity, feed)"
      >
        Unsubscribe
      </a>
    </h2>
    <p
      v-if="feed.meta && feed.meta.description"
      class="description"
    >
      {{ feed.meta.description }}
    </p>
    <p
      v-if="feed.error"
      class="description red"
    >
      {{ feed.error }}
    </p>
    <p class="hint">
      Source: <a
        target="_blank"
        :href="feed.url"
        class="link"
      >{{ feed.url }}</a>
    </p>
  </li>
</template>

<script>
export default {
  props: ['app', 'feed']
}
</script>
