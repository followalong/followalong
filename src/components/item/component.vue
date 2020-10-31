<template>
  <div
    v-if="item && item.feed"
    class="single-item"
  >
    <EmbedMedia
      v-if="app.hasMedia(item)"
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
          :to="{ name: 'feed', params: { feed_url: item.feed.url } }"
          class="feed-name"
        >
          <span v-if="item.author && item.author !== item.feed.name">
            {{ item.author }} @
          </span>
          <span>
            {{ item.feed.name }}
          </span>
        </router-link>

        &mdash;

        <span
          v-if="item.pubDate"
          :title="item.pubDate"
          class="feed-name"
        >{{ app.dateFormat(item.pubDate, app.now) }}</span>
      </h3>

      <div
        v-if="item.content"
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
          :class="'button' + (item.isSaved ? '' : ' button-gray')"
          @click="app.saveForLater(item)"
        >
          Save<span v-if="item.isSaved">d</span>
        </a>

        &nbsp;

        <a
          href="javascript:;"
          class="button button-gray"
          @click="app.read(item)"
        >
          Mark As <span v-if="item.isRead">Unread</span><span v-else>Read</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import EmbedMedia from '@/components/embed-media/component.vue'

export default {
  components: {
    EmbedMedia
  },
  props: ['app'],
  computed: {
    related () {
      var _ = this

      return _.app.newsfeed.filter(function (i) {
        return i !== _.item
      }).slice(0, 7)
    },

    item () {
      var _ = this

      return (_.app.identity.items || []).find(function (item) {
        return item.guid + '' === _.$route.params.guid + ''
      })
    }
  },
  watch: {
    'item.guid' () {
      var _ = this

      if (_.item) {
        _.app.read(_.item, true)
      }
    }
  },
  mounted () {
    var _ = this

    if (_.item) {
      _.app.read(_.item, true)
    }
  }
}
</script>
