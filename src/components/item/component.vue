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

      <span :title="item.pubDate" v-if="item.pubDate" class="feed-name">{{dateFormat(item.pubDate, app.now)}}</span>

      &nbsp; <QuickSubscribe :app="app" :feed="item.feed" />
    </div>

    <div v-if="showContent">
      <ClickableMedia :item="item" :app="app" v-if="app.hasMedia(item)" />

      <div v-if="item.content && item.content.length">
        <div class="description">
          <div v-if="!isExpanded && item.content.length > characterLimit">
            <div v-html="app.prepDescription(item, characterLimit, '...')"></div>
            <button class="button-gray" v-on:click="isExpanded = !isExpanded">
              Read More
            </button>
          </div>

          <div v-else>
            <div v-if="item.content" v-html="app.blankifyLinks(item.content)"></div>
          </div>
        </div>
      </div>

      <p class="hint float-right">
        <a href="javascript:;" v-on:click="app.saveForLater(item)">
          <font-awesome-icon icon="save" :class="item.isSaved ? 'selected' : ''" />
        </a>

        <a :href="item.link" target="_blank" v-on:click="app.read(item, true)">
          <font-awesome-icon icon="link" />
        </a>
      </p>

      <p class="hint">Comments are closed.</p>
    </div>
  </li>
</template>

<script>
import methods from '@/components/app/methods';
import ClickableMedia from '@/components/clickable-media/component.vue';
import QuickSubscribe from '@/components/quick-subscribe/component.vue';

export default {
  name: 'sidebar',
  props: ['app', 'item', 'showContent'],
  components: {
    ClickableMedia,
    QuickSubscribe
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
