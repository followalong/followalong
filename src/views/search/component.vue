<template>
  <div class="search">
    <div class="title-wrapper">
      <h1>
        Search{{ q ? ':' : '' }} <strong>{{ q }}</strong>
      </h1>
    </div>

    <p
      v-if="error"
      class="red"
    >
      {{ error }}
    </p>

    <div v-else>
      <p v-if="isLoading">
        Loading...
      </p>
      <div v-else>
        <div
          v-if="feeds.length"
          class="list"
        >
          <div
            v-for="feed in feeds"
            :key="feed.url"
          >
            <button
              class="float-right"
              @click="app.commands.addFeedToIdentity(app.identity, feed)"
            >
              Subscribe
            </button>
            <h2>
              <router-link :to="{ name: 'feed', params: { feed_url: feed.url } }">
                {{ feed.name }}
              </router-link>
            </h2>
            <p class="hint">
              {{ feed.url }} ({{ feed.source }})
            </p>
          </div>
        </div>
        <div v-else>
          <p>
            We didn't find anything. :(
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['app'],
  data: function () {
    return {
      error: '',
      isLoading: true,
      q: this.$route.query.q || '',
      feeds: []
    }
  },
  watch: {
    '$route.query.q' (val) {
      this.search(val)
    },
    'app.identity' (val) {
      this.search(this.q)
    }
  },
  mounted () {
    this.search(this.$route.query.q)
  },
  methods: {
    search (q) {
      this.q = q
      this.isLoading = true
      this.error = ''

      const service = this.app.queries.serviceForIdentity(this.app.identity, 'search')

      if (!service) {
        this.isLoading = false
        this.error = 'You don\'t have a Search Service configured.'
        this.feeds = []
        return
      }

      service.request(this.app.identity, {
        action: 'search',
        q: this.q
      }, (err, feeds) => {
        this.isLoading = false

        if (!feeds) {
          this.error = err || 'Could not search. Perhaps it\'s a problem with your Search Service?'
          return
        }

        if (feeds.length === 1) {
          this.$router.push({ name: 'feed', params: { feed_url: feeds[0].url } })
        }

        this.feeds = feeds
      })
    }
  }
}
</script>
