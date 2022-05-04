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
          v-if="results > 0"
          class="list"
        >
          <ul
            v-if="existingItems.length"
            class="items"
          >
            <Item
              v-for="item in existingItems"
              :key="item.guid"
              :item="item"
              :app="app"
              show-content="true"
            />
          </ul>
          <div
            v-for="feed in existingFeeds"
            :key="feed.url"
          >
            <h2>
              <router-link :to="{ name: 'feed', params: { feed_url: feed.url } }">
                {{ feed.name }}
              </router-link>
            </h2>
            <p class="hint">
              {{ feed.url }} ({{ feed.source }})
            </p>
          </div>
          <div
            v-for="feed in newFeeds"
            :key="feed.url"
          >
            <!-- <button
              class="float-right"
              :aria-label="'Subscribe to ' + feed.name"
              @click="app.commands.addFeedToIdentity(app.identity, feed)"
            >
              Subscribe
            </button> -->
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
import Item from '@/app/components/item/component.vue'

export default {
  components: {
    Item
  },
  props: ['app'],
  data: function () {
    return {
      error: '',
      isLoading: true,
      q: this.$route.query.q || '',
      newFeeds: [],
      existingFeeds: [],
      existingItems: []
    }
  },
  computed: {
    results () {
      return this.newFeeds.length + this.existingFeeds.length + this.existingItems.length
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

      this.existingFeeds = this.app.queries.feedsForIdentityWithQuery(this.app.identity, this.q)
      this.existingItems = this.app.queries.itemsForIdentityWithQuery(this.app.identity, this.q)

      const addon = this.app.queries.addonForIdentity(this.app.identity, 'search')

      if (!addon) {
        this.isLoading = false
        this.error = 'You don\'t have a Search Addon configured.'
        this.newFeeds = []
        return
      }

      addon.search(this.q).then((feeds) => {
        if (!feeds) {
          this.error = 'Could not search. Perhaps it\'s a problem with your Search Addon?'
          return
        }

        this.newFeeds = feeds.map((feed) => {
          return this.app.commands.addFeed(feed)
        })
      })
        .catch(() => {
          this.newFeeds = []
        })
        .finally(() => {
          this.isLoading = false
        })
    }
  }
}
</script>
