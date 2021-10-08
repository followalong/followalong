<template>
  <div
    v-if="item"
    class="single-item"
  >
    <MediaPlayer
      v-if="app.queries.hasMedia(item)"
      :item="item"
      :app="app"
      :autoplay="true"
    />

    <br>

    <div class="feed home-feed wide-feed">
      <div class="title-wrapper">
        <h1>
          <a :href="item.link">{{ item.title }}</a>
        </h1>
      </div>

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

        &mdash;

        <span
          v-if="item.pubDate"
          :title="item.pubDate"
          class="feed-name"
        >{{ app.prettyDate(item.pubDate) }}</span>
      </h3>

      <div
        v-if="item.content && item.content.length"
        class="description"
        v-html="app.blankifyLinks(item.content)"
      />

      <div style="margin-top: 20px;">
        <a
          :href="item.link"
          class="button"
          target="_blank"
        >
          View Source
        </a>

        &nbsp;

        <a
          href="javascript:;"
          :class="'button' + (app.queries.isSaved(item) ? '' : ' button-gray')"
          :aria-label="'Save for later: ' + item.title"
          @click="app.commands.toggleSave(item)"
        >
          Save<span v-if="app.queries.isSaved(item)">d</span>
        </a>

        &nbsp;

        <a
          href="javascript:;"
          class="button button-gray"
          :aria-label="'Mark as read: ' + item.title"
          @click="app.commands.toggleRead(item)"
        >
          Mark As <span v-if="item.isRead">Unread</span><span v-else>Read</span>
        </a>
      </div>
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
import MediaPlayer from '@/components/media-player/component.vue'

export default {
  components: {
    MediaPlayer
  },
  props: ['app'],
  computed: {
    item () {
      return this.app.identityItems.find((item) => item.guid + '' === this.$route.params.guid + '')
    },
    feed () {
      return this.app.state.find('feeds', (f) => f.url === this.$route.params.feed_url)
    }
  },
  watch: {
    'item.guid' () {
      if (this.item) {
        this.app.commands.toggleRead(this.item, true)
      }
    }
  },
  mounted () {
    if (this.item) {
      this.app.commands.toggleRead(this.item, true)
    }

    if (this.feed) {
      this.app.commands.fetchFeed(this.feed)
    }
  }
}
</script>
