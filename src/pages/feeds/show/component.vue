<template>
  <div v-if="feed">
    <div class="feed wide-feed">
      <div class="title-wrapper">
        <Dropdown class="float-right">
          <li v-if="app.queries.identityForFeed(feed) && app.queries.unreadItems(feed).length">
            <a
              href="javascript:;"
              @click="catchFeedUp()"
            >
              Catch Me Up!
            </a>
          </li>
          <li v-if="app.queries.identityForFeed(feed)">
            <a
              href="javascript:;"
              @click="app.commands.fetchFeed(feed, app.identity)"
            >
              <span v-if="app.queries.isFetching(feed)">Fetching...</span>
              <span v-else>Fetch Now</span>
            </a>
          </li>
          <li v-if="app.queries.identityForFeed(feed)">
            <a
              href="javascript:;"
              @click="unsubscribe()"
            >
              Unsubscribe
            </a>
          </li>
          <li v-if="!app.queries.identityForFeed(feed)">
            <a
              href="javascript:;"
              @click="subscribe"
            >
              Subscribe
            </a>
          </li>
        </Dropdown>

        <h1>
          <router-link :to="{ name: 'feed', params: { feed_url: feed.url } }">
            {{ feed.name }}
          </router-link>

          <font-awesome-icon
            v-if="app.queries.isFetching(feed)"
            icon="spinner"
            spin
            class="i"
          />

          <a
            v-else-if="app.queries.identityForFeed(feed)"
            href="javascript:;"
            class="i"
            @click="app.commands.togglePause(feed)"
          >
            <span v-if="app.queries.isPaused(feed)">&#10074;&#10074;</span>
            <span v-else>&#9658;</span>
          </a>
        </h1>
      </div>

      <ul class="items">
        <li v-if="app.queries.isFetching(feed)">
          <p>
            <font-awesome-icon
              v-if="app.queries.isFetching(feed)"
              icon="spinner"
              spin
              class="i"
            />
            &nbsp; Loading...
          </p>
        </li>
        <li v-else-if="items.length === 0">
          <h3>You're all caught up!</h3>
          <p>
            If you want to be able to see more "history", visit the <router-link
              to="/settings"
              class="link"
            >
              Settings
            </router-link> page and increase the maximum number of items to keep.
          </p>
        </li>

        <Item
          v-for="item in items"
          :key="item.guid"
          :item="item"
          :app="app"
          show-content="true"
        />
      </ul>
    </div>
  </div>
</template>

<script>
import Item from '@/components/item/component.vue'
import Dropdown from '@/components/dropdown/component.vue'

export default {
  components: {
    Item,
    Dropdown
  },
  props: ['app'],
  computed: {
    feed () {
      let feed = this.app.state.find('feeds', (f) => f.url === this.$route.params.feed_url)

      if (!feed) {
        feed = this.app.commands.addFeed({ url: this.$route.params.feed_url })
      }

      return feed
    },
    items () {
      return this.app.queries.itemsForFeed(this.feed)
    }
  },
  mounted () {
    if (this.feed) {
      this.app.commands.fetchFeed(this.feed, this.app.identity)
    }
  },
  methods: {
    unsubscribe () {
      this.app.commands.unsubscribe(this.feed)
      this.$router.push('/feeds')
    },

    subscribe () {
      this.app.commands.addFeedToIdentity(this.app.identity, this.feed)
    }
  }
}
</script>
