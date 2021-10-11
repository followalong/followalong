<template>
  <div
    v-if="item"
    class="single-item"
  >
    <div class="feed home-feed wide-feed">
      <div class="title-wrapper">
        <Dropdown class="float-right">
          <li v-if="item.link">
            <a
              :href="item.link"
              target="_blank"
            >
              View Source
            </a>
          </li>

          <li v-if="app.queries.identityForFeed(feed)">
            <a
              href="javascript:;"
              :aria-label="'Save for later: ' + item.title"
              @click="app.commands.toggleSave(item)"
            >
              Save<span v-if="app.queries.isSaved(item)">d</span>
            </a>
          </li>

          <li v-if="app.queries.identityForFeed(feed)">
            <a
              href="javascript:;"
              :aria-label="'Mark as read: ' + item.title"
              @click="app.commands.toggleRead(item)"
            >
              Mark As <span v-if="app.queries.isRead(item)">Unread</span><span v-else>Read</span>
            </a>
          </li>
        </Dropdown>

        <h1>
          <a :href="item.link">{{ item.title }}</a>
        </h1>

        <h3>
          <router-link
            :to="{ name: 'feed', params: { feed_url: feed.url } }"
            class="feed-name"
          >
            <span v-if="item.author && item.author !== feed.name">
              {{ item.author }} @
            </span>
            <span>
              {{ feed.name }}
            </span>
          </router-link>

          <span
            v-if="item.pubDate"
            :title="item.pubDate"
            class="feed-name"
          >&nbsp; &mdash; &nbsp;{{ app.prettyDate(item.pubDate) }}</span>
        </h3>
      </div>

      <div
        v-if="item.content && item.content.length"
        class="description"
        v-html="app.blankifyLinks(item.content)"
      />
    </div>
  </div>
  <font-awesome-icon
    v-else-if="feed && app.queries.isFetching(feed)"
    icon="spinner"
    spin
    class="i"
  />
</template>

<script>
import Dropdown from '@/components/dropdown/component.vue'

export default {
  components: {
    Dropdown
  },
  props: ['app'],
  computed: {
    item () {
      return this.app.queries.itemsForFeed(this.feed).find((item) => item.guid + '' === this.$route.params.guid + '')
    },
    feed () {
      let feed = this.app.state.find('feeds', (f) => f.url === this.$route.params.feed_url)

      if (!feed) {
        feed = this.app.commands.addFeed({ url: this.$route.params.feed_url })
      }

      return feed
    }
  },
  watch: {
    'item.guid' () {
      this.start()
    }
  },
  mounted () {
    this.start()
  },
  methods: {
    start () {
      if (this.item) {
        this.app.commands.toggleRead(this.item, true)
      } else if (this.feed) {
        this.app.commands.fetchFeed(this.feed, this.app.identity)
      }

      if (this.app.queries.hasMedia(this.item)) {
        this.app.play(this.item)
      }
    }
  }
}
</script>
