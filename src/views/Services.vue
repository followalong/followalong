<template>
  <div class="narrow-container">
    <div class="title-wrapper">
      <h1>Services</h1>
    </div>

    <p>
      External services are not <em>required</em>, but they <em>can</em> improve load times, search results, cache images, allow for syncing and publishing, and much more.
    </p>

    <vue-tabs>
      <v-tab v-for="(serverType, key) in serverTypes" :key="key" :title="serverType.shortName">
        <div class="field">
          <h3>{{serverType.name}}</h3>
          <p v-html="serverType.description"></p>
        </div>

        <ServiceEditor :app="app" :serverType="serverType" :serverTypeKey="key" />
      </v-tab>
    </vue-tabs>
  </div>
</template>

<script>
import {VueTabs, VTab} from 'vue-nav-tabs';
import ServiceEditor from '@/components/service-editor/component.vue';

var SERVER_TYPES = {
  rss: {
    shortName: 'RSS',
    name: 'RSS Proxy',
    description: 'On the internet, there is a technical issue known as CORS, which blocks us from accessing some RSS feeds directly. You may use a proxy to get around the CORS issue, as well as bypassing geographically-restricted content.'
  },
  sync: {
    shortName: 'Sync',
    name: 'Subscription Syncing & Storage',
    description: 'Store and sync your subscriptions and saved items across multiple devices.'
  },
  publish: {
    shortName: 'Publish',
    name: 'Feed Publishing',
    description: 'Publish your own RSS feed.',
  },
  search: {
    shortName: 'Search',
    name: 'Search Proxy',
    description: 'Provide a smarter, faster search.',
  },
  media: {
    shortName: 'Media',
    name: 'Media Proxy',
    description: 'Avoid hotlinking or keep your media stored long-term.',
  },
  // ads: {
  //   shortName: 'ads',
  //   name: 'Ads Proxy',
  //   description: 'Opt-in to receive ads which compensate the feeds you follow.',
  // }
};

export default {
  props: ['app'],
  components: {
    ServiceEditor,
    VueTabs,
    VTab
  },
  data() {
    return {
      selectedServerType: SERVER_TYPES.rss,
      serverTypes: SERVER_TYPES
    }
  }
};
</script>
