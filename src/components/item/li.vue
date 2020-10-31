<template>
  <li
    v-if="item && item.feed"
    :class="item.isRead ? 'read' : ''"
  >
    <a
      href="javascript:;"
      class="check"
      @click="app.read(item)"
    >&check;</a>

    <h3>
      <router-link :to="{ name: 'item', params: { feed_url: item.feed.url, guid: item.guid } }">
        {{ item.title }}
      </router-link>
    </h3>

    <div class="feed-meta">
      <router-link
        :to="{ name: 'feed', params: { feed_url: item.feed.url } }"
        class="feed-name"
      >
        <span v-if="item.author && item.author !== item.feed.name">
          {{ item.author }} @
        </span>
        {{ item.feed.name }}
      </router-link>

      &mdash;

      <span
        v-if="item.pubDate"
        :title="item.pubDate"
        class="feed-name"
      >{{ app.dateFormat(item.pubDate, app.now) }}</span>

      &nbsp; <QuickSubscribe
        :app="app"
        :feed="item.feed"
      />
    </div>

    <div
      v-if="showContent"
    >
      <EmbedMedia
        v-if="app.hasMedia(item)"
        :item="item"
        :app="app"
      />

      <div v-if="item.content && item.content.length">
        <div class="description">
          <div v-if="!isExpanded && item.content.length > characterLimit">
            <div v-html="prepDescription(item, characterLimit, '...')" />
            <button
              class="button-gray"
              @click="isExpanded = !isExpanded"
            >
              Read More
            </button>
          </div>

          <div v-else>
            <div
              v-if="item.content"
              v-html="app.blankifyLinks(item.content)"
            />
          </div>
        </div>
      </div>

      <p class="hint float-right">
        <a
          href="javascript:;"
          @click="app.saveForLater(item)"
        >
          <font-awesome-icon
            icon="save"
            :class="item.isSaved ? 'selected' : ''"
          />
        </a>

        <a
          :href="item.link"
          target="_blank"
          @click="app.read(item, true)"
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
import EmbedMedia from '@/components/embed-media/component.vue'
import QuickSubscribe from '@/components/quick-subscribe/component.vue'

const ALLOWED_TAGS = [
  'a', 'article', 'b', 'blockquote', 'br', 'caption', 'code', 'del', 'details', 'div', 'em',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'main', 'ol',
  'p', 'pre', 'section', 'span', 'strike', 'strong', 'sub', 'summary', 'sup', 'table',
  'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul'
]

export default {
  components: {
    EmbedMedia,
    QuickSubscribe
  },
  props: ['app', 'item', 'showContent'],
  data () {
    return {
      characterLimit: 450,
      isExpanded: false
    }
  },
  methods: {
    prepDescription (item, characterLimit, ellipsis) {
      if (!item || !item.content) {
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
