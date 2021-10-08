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
      >{{ item.prettyDate }}</span>
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
        <div class="description">
          <div v-if="!isExpanded && hasContent && item.content.length > characterLimit">
            <div v-html="prepDescription(item, characterLimit, '...')" />
            <button
              class="button-gray"
              @click="isExpanded = !isExpanded"
            >
              Read More
            </button>
          </div>
          <div
            v-else-if="hasContent"
            v-html="app.blankifyLinks(item.content)"
          />
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
import truncate from 'trunc-html'
import MediaPlayer from '@/components/media-player/component.vue'

const ALLOWED_TAGS = [
  'a', 'article', 'b', 'blockquote', 'br', 'caption', 'code', 'del', 'details', 'div', 'em',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'main', 'ol',
  'p', 'pre', 'section', 'span', 'strike', 'strong', 'sub', 'summary', 'sup', 'table',
  'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul'
]

export default {
  components: {
    MediaPlayer
  },
  props: ['app', 'item', 'showContent'],
  data () {
    return {
      characterLimit: 450,
      isExpanded: false
    }
  },
  computed: {
    hasContent () {
      return this.item ? (this.item.content || '').trim().length : false
    },
    feed () {
      return this.app.state.find('feeds', (f) => f.url === this.item.feedUrl)
    }
  },
  methods: {
    prepDescription (item, characterLimit, ellipsis) {
      if (!this.hasContent) {
        return ''
      }

      return this.app.blankifyLinks(truncate(
        item.content,
        characterLimit,
        {
          sanitizer: {
            allowedTags: ALLOWED_TAGS
          }
        }
      ).html)
    }
  }
}
</script>
