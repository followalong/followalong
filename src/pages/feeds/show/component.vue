<template>
  <div v-if="feed">
    <div class="feed wide-feed">
      <div class="title-wrapper">
        <Dropdown class="float-right">
          <li v-if="feed.hasUnreadItems">
            <a
              href="javascript:;"
              @click="catchFeedUp()"
            >
              Catch Me Up!
            </a>
          </li>
          <li>
            <a
              href="javascript:;"
              @click="app.commands.fetchFeed(feed)"
            >
              <span v-if="app.queries.isFetching(feed)">Fetching...</span>
              <span v-else>Fetch Now</span>
            </a>
          </li>
          <li>
            <a
              href="javascript:;"
              @click="unsubscribe()"
            >
              Unsubscribe
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
            v-else
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
      return this.app.state.find('feeds', (f) => f.url === this.$route.params.feed_url)
    },
    items () {
      return this.app.queries.itemsForFeed(this.feed)
    }
  },
  mounted () {
    if (this.feed) {
      this.app.commands.fetchFeed(this.feed)
    }
  },
  methods: {
    unsubscribe () {
      this.app.commands.unsubscribe(this.feed)
      this.$router.push('/feeds')
    }
  }
}
</script>
