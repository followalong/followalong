<template>
  <li>
    <button
      :class="feed.isLoading ? 'loading' : ''"
      @click="fetch()"
    >
      <span v-if="feed.isLoading">Loading...</span>
      <span v-else>Fetch Now</span>
    </button>
    <button
      :class="feed.paused ? 'button-gray' : ''"
      @click="togglePause()"
    >
      <span v-if="feed.paused">&#10074;&#10074;</span>
      <span v-else>&#9658;</span>
    </button>
    <h2>
      <router-link :to="{ name: 'feed', params: { feed_url: feed.url } }">
        {{ feed.name }}
      </router-link>
      <a
        href="javascript:;"
        class="hint remove"
        @click="app.unsubscribeFeed(app, app.identity, feed)"
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
    <p>
      <a
        :href="feed.url"
        class="hint"
      >Source: {{ feed.url }}</a>
    </p>
  </li>
</template>

<script>
export default {
  props: ['app', 'feed'],
  methods: {
    fetch () {
      var _ = this

      _.feed.fetch(_.app, Date.now(), true, () => {
        _.feed.save()
      })
    },

    togglePause () {
      var _ = this

      _.feed._updatedAt = Date.now()
      _.feed.paused = !_.feed.paused
      _.feed.save()
    }
  }
}
</script>
