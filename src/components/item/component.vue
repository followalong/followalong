<template>
  <li v-if="!feed">
    <p>Feed not found – try adding it:</p>
    <p>{{ item.feedUrl }}</p>
  </li>
  <li
    v-else
    :class="app.queries.isRead(item) ? 'read' : ''"
  >
    <a
      href="javascript:;"
      class="check"
      :aria-label="'Mark as read: ' + item.title"
      @click="app.commands.toggleRead(item)"
    >&check;</a>

    <h3>
      <router-link :to="{ name: 'item', params: { feed_url: feed.url, guid: item.guid } }">
        {{ item.title }}
      </router-link>
    </h3>

    <div class="feed-meta">
      <router-link
        :to="{ name: 'feed', params: { feed_url: feed.url } }"
        class="feed-name"
      >
        <span v-if="item.author && item.author !== feed.name">
          {{ item.author }} @
        </span>
        {{ feed.name }}
      </router-link>

      &mdash;

      <span
        v-if="item.pubDate"
        :title="item.pubDate"
        class="feed-name"
      >{{ app.prettyDate(item.pubDate) }}</span>
    </div>

    <div
      v-if="showContent"
    >
      <MediaPlayer
        v-if="app.queries.hasMedia(item)"
        :item="item"
        :app="app"
      />

      <div v-if="hasContent">
        <div
          v-if="isExpanded || !isTruncated"
          class="description expanded"
          v-html="app.blankifyLinks(item.content)"
        />

        <div
          v-else-if="shortContent"
          class="description relativizer"
        >
          <div v-html="app.blankifyLinks(shortContent)" />
          <div class="faded-content">
            <button
              class="button-gray button-large"
              @click="isExpanded = !isExpanded"
            >
              Read More
            </button>
          </div>
        </div>
      </div>

      <p class="hint float-right">
        <a
          href="javascript:;"
          :aria-label="'Save for later: ' + item.title"
          @click="app.commands.toggleSave(item)"
        >
          <font-awesome-icon
            icon="save"
            :class="app.queries.isSaved(item) ? 'selected' : ''"
          />
        </a>

        <a
          :href="item.link"
          target="_blank"
          @click="app.commands.toggleRead(item, true)"
        >
          <font-awesome-icon icon="link" />
        </a>
      </p>

      <p class="hint">
        Comments are closed.
      </p>
    </div>
  </li>
</template>

<script>
import MediaPlayer from '@/components/media-player/component.vue'

const WORD_LIMIT = 125

export default {
  components: {
    MediaPlayer
  },
  props: ['app', 'item', 'showContent'],
  data () {
    return {
      isExpanded: false
    }
  },
  computed: {
    hasContent () {
      return this.item ? (this.item.content || '').trim().length : false
    },
    feed () {
      return this.app.state.find('feeds', (f) => f.url === this.item.feedUrl)
    },
    words () {
      return this.item.content.split(/\s+/)
    },
    isTruncated () {
      return this.words.length > WORD_LIMIT
    },
    shortContent () {
      return `${this.words.slice(0, WORD_LIMIT).join(' ').trim()}...`
    }
  }
}
</script>
