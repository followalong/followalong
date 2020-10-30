<template>
  <div class="narrow-container">
    <div class="title-wrapper">
      <h1>Services</h1>
    </div>

    <p>
      External services are not <em>required</em>, but they <em>can</em> improve load times, search results, cache images, allow for syncing and publishing, and much more.
    </p>

    <div
      v-for="(serverType, key) in serverTypes"
      :key="key"
      :title="serverType.shortName"
    >
      <div class="field">
        <h2>{{ serverType.name }}</h2>
        <p v-html="serverType.description" />
      </div>

      <ServiceEditor
        :app="app"
        :server-type="serverType"
        :server-type-key="key"
      />

      <hr>
    </div>
  </div>
</template>

<script>
import ServiceEditor from '@/components/service-editor/component.vue'

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
  // publish: {
  //   shortName: 'Publish',
  //   name: 'Feed Publishing',
  //   description: 'Publish your own RSS feed.'
  // },
  search: {
    shortName: 'Search',
    name: 'Search Proxy',
    description: 'Provide a smarter, faster search.'
  }
  // media: {
  //   shortName: 'Media',
  //   name: 'Media Proxy',
  //   description: 'Avoid hotlinking or keep your media stored long-term.'
  // }
  // ads: {
  //   shortName: 'ads',
  //   name: 'Ads Proxy',
  //   description: 'Opt-in to receive ads which compensate the feeds you follow.',
  // }
}

export default {
  components: {
    ServiceEditor
  },
  props: ['app'],
  data () {
    return {
      selectedServerType: SERVER_TYPES.rss,
      serverTypes: SERVER_TYPES
    }
  }
}
</script>
