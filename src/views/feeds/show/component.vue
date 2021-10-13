<template>
  <div v-if="feed">
    <div class="feed wide-feed">
      <div class="title-wrapper">
        <Dropdown class="float-right">
          <li v-if="app.queries.identityForFeed(feed) && app.queries.unreadItems(feed).length">
            <a
              href="javascript:;"
              :aria-label="`Catch up on ${feed.name}`"
              @click="app.commands.catchMeUp(items)"
            >
              Catch Me Up!
            </a>
          </li>
          <li v-if="app.queries.identityForFeed(feed)">
            <a
              href="javascript:;"
              :aria-label="`Fetch ${feed.name}`"
              @click="app.commands.fetchFeed(feed, app.identity)"
            >
              <span v-if="app.queries.isFetching(feed)">Fetching...</span>
              <span v-else>Fetch Now</span>
            </a>
          </li>
          <li v-if="app.queries.identityForFeed(feed)">
            <a
              href="javascript:;"
              :aria-label="`Pause ${feed.name}`"
              @click="app.commands.togglePause(feed)"
            >
              <span v-if="app.queries.isPaused(feed)">Unpause</span>
              <span v-else>Pause</span>
            </a>
          </li>
          <li v-if="app.queries.identityForFeed(feed)">
            <a
              href="javascript:;"
              aria-label="`Unsubscribe ${feed.name}`"
              @click="unsubscribe()"
            >
              Unsubscribe
            </a>
          </li>
          <li v-if="!app.queries.identityForFeed(feed)">
            <a
              href="javascript:;"
              :aria-label="'Subscribe to ' + feed.name"
              @click="app.commands.addFeedToIdentity(app.identity, feed)"
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
        <template v-if="items.length === 0">
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
          <li v-else>
            <h3>You're all caught up on {{ feed.name }}!</h3>
          </li>
        </template>

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
      let feed = this.app.queries.findFeedByUrl(this.$route.params.feed_url)

      if (!feed) {
        this.app.commands.addFeed({ url: this.$route.params.feed_url })
        feed = this.app.queries.findFeedByUrl(this.$route.params.feed_url)
      }

      return feed
    },
    items () {
      return this.app.queries.itemsForFeed(this.feed)
    }
  },
  mounted () {
    if (this.feed) {
      return this.app.commands.fetchFeed(this.feed, this.app.identity)
    }
  },
  methods: {
    unsubscribe () {
      return this.app.commands.unsubscribe(this.feed)
        .then(() => this.$router.push('/feeds'))
    }
  }
}
</script>
