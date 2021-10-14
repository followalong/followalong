<template>
  <li
    :class="app.queries.isRead(item) ? 'read' : ''"
  >
    <a
      href="javascript:;"
      class="check"
      :aria-label="`${app.queries.isRead(item) ? 'Unread' : 'Read'} ${item.title}`"
      @click="app.commands.toggleRead(app.identity, item)"
    >&check;</a>

    <h3>
      <router-link
        :to="{ name: 'item', params: { feed_url: feed.url, guid: item.guid } }"
        :aria-label="`Visit item ${item.title}`"
      >
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
      ref="content"
    >
      <router-link
        v-if="app.queries.hasMedia(item)"
        :to="{ name: 'item', params: { feed_url: feed.url, guid: item.guid } }"
      >
        <MediaPreview :item="item" />
      </router-link>

      <div
        v-if="hasContent"
      >
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
              :aria-label="`Read more ${item.title}`"
              @click="toggleExpanded"
            >
              Read More
            </button>
          </div>
        </div>
      </div>

      <p class="hint float-right">
        <a
          href="javascript:;"
          :aria-label="`${app.queries.isSaved(item) ? 'Unsave' : 'Save'} ${item.title}`"
          @click="app.commands.toggleSave(app.identity, item)"
        >
          <font-awesome-icon
            icon="save"
            :class="app.queries.isSaved(item) ? 'selected' : ''"
          />
        </a>

        <a
          :href="item.link"
          target="_blank"
          :aria-label="`Visit source ${item.title}`"
          @click="app.commands.toggleRead(app.identity, item, true)"
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
import MediaPreview from '@/components/media-player/media-preview/component.vue'

const WORD_LIMIT = 125

export default {
  components: {
    MediaPreview
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
  },
  methods: {
    toggleExpanded () {
      this.isExpanded = !this.isExpanded

      if (this.isExpanded) {
        setTimeout(() => {
          window.scroll({
            top: this.$refs.content.offsetTop - 80,
            left: 0,
            behavior: 'smooth'
          })
        }, 0)
      }
    }
  }
}
</script>
