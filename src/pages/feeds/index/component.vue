<template>
  <div class="feeds">
    <div class="title-wrapper">
      <button
        :class="'float-right ' + (app.identity.isLoading ? 'loading' : '')"
        @click="app.commands.fetchAllFeeds(app.identity)"
      >
        <span v-if="app.identity.isLoading">Loading...</span>
        <span v-else>Fetch All Feeds</span>
      </button>

      <h1>Feeds</h1>
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
import Feed from '@/components/feed/component.vue'
import utils from '@/components/app/utils'

export default {
  components: {
    Feed
  },
  props: ['app'],
  computed: {
    feeds () {
      return this.app.identityFeeds.sort(utils.sorters.NAME)
    }
  }
}
</script>
