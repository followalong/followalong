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
      >{{ app.queries.prettyPublishedDate(item) }}</span>
    </div>

    <div
      v-if="showContent"
      ref="content"
      class="item-content"
    >
      <MediaPreview
        v-if="app.queries.hasImage(item)"
        :app="app"
        :item="item"
      />

      <div
        v-if="hasContent"
      >
        <div
          v-if="isExpanded || !isTruncated"
          class="description expanded"
          v-html="content"
        />

        <div
          v-else-if="shortContent"
          class="description relativizer"
        >
          <div v-html="shortContent" />
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

      <div class="item-meta">
        <p class="quick-links">
          <a
            href="javascript:;"
            :aria-label="`${app.queries.isSaved(item) ? 'Unsave' : 'Save'} ${item.title}`"
            @click="app.commands.toggleSave(app.identity, item)"
          >
            <font-awesome-icon
              icon="save"
              :class="app.queries.isSaved(item) ? 'is-saved' : ''"
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
    </div>
  </li>
</template>

<script>
import MediaPreview from '@/app/components/media-player/media-preview/component.vue'

const CONTENT_LEEWAY = 10

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
      return !!this.content.length
    },
    feed () {
      return this.app.queries.findFeedByUrl(this.item.feedUrl)
    },
    isTruncated () {
      return this.shortContent.length + CONTENT_LEEWAY < this.content.length
    },
    content () {
      return this.app.queries.itemContent(this.item)
    },
    shortContent () {
      return this.app.queries.itemShortContent(this.item)
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
