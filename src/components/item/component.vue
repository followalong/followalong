<template>
  <li v-if="item && item.feed" :class="item.isRead ? 'read' : ''">
    <a href="javascript:;" class="check" v-on:click="app.read(item)">&check;</a>

    <h3>
      <router-link :to="{ name: 'item', params: { feed_url: item.feed.url, guid: item.guid } }">
        {{ item.title }}
      </router-link>
    </h3>

    <div class="feed-meta">
      <router-link :to="{ name: 'feed', params: { feed_url: item.feed.url } }" class="feed-name">
        <span v-if="item.author && item.author !== item.feed.name">
          {{item.author}} @
        </span>
        {{item.feed.name}}
      </router-link>

      &mdash;

      <span :title="item.pubDate" v-if="item.pubDate" class="feed-name">{{dateFormat(item.pubDate)}}</span>
    </div>

    <div v-if="showContent">
      <div v-if="item.content && item.content.length">
        <div class="description">
          <div v-if="!isExpanded && item.content.length > characterLimit">
            <div v-html="app.prepDescription(item, characterLimit, '...')"></div>
            <button class="button-gray float-right" v-on:click="isExpanded = !isExpanded">
              Expand &nbsp; &raquo;
            </button>
          </div>

          <div v-else>
            <div v-if="item.content" v-html="item.content"></div>
          </div>
        </div>
      </div>

      <ClickableMedia :item="item" :app="app" v-else />

      <p class="hint float-right">
        <a :href="item.link" target="_blank" v-on:click="app.read(item, true)">
          View Source
        </a>
      </p>

      <p class="hint">Comments are closed.</p>
    </div>
  </li>
</template>

<script>
import methods from '@/components/app/methods';
import ClickableMedia from '@/components/clickable-media/component.vue';

export default {
  name: 'sidebar',
  props: ['app', 'item', 'showContent'],
  components: {
    ClickableMedia
  },
  data() {
    return {
      characterLimit: 450,
      isExpanded: false
    };
  },
  methods
};
</script>
