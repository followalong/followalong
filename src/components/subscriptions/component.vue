<template>
  <div class="feeds">
    <div class="title-wrapper">
      <button
        :class="'float-right ' + (app.loading ? 'loading' : '')"
        @click="app.fetchAllFeeds(app.identity, true)"
      >
        <span v-if="app.loading">Loading...</span>
        <span v-else>Fetch All Feeds</span>
      </button>

      <h1>Subscriptions</h1>
    </div>

    <ul>
      <Feed
        v-for="feed in feeds"
        :key="feed.url"
        :feed="feed"
        :app="app"
      />
    </ul>
  </div>
</template>

<script>
import Feed from '@/components/feed/li.vue'
import utils from '@/components/app/utils'

export default {
  components: {
    Feed
  },
  props: ['app'],
  computed: {
    feeds () {
      if (!this.app.identity) return []
      return (this.app.identity.feeds || []).sort(utils.sorters.NAME)
    }
  }
}
</script>
