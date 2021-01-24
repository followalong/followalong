<template>
  <div class="narrow-container">
    <div class="title-wrapper">
      <h1>Services</h1>
    </div>

    <p>
      External services are not <em>required</em>, but they <em>can</em> improve load times, search results, cache images, allow for syncing and publishing, and much more.
    </p>

    <div
      v-for="(serviceType, key) in serviceTypes"
      :key="key"
      :title="serviceType.shortName"
    >
      <div class="field">
        <h2>{{ serviceType.name }}</h2>
        <p v-html="serviceType.description" />
      </div>

      <ServiceEditor
        :app="app"
        :server-type="serviceType"
        :server-type-key="key"
      />

      <hr>
    </div>
  </div>
</template>

<script>
import ServiceEditor from '@/pages/services/service-editor/component.vue'
import SERVICE_TYPES from './types.js'

export default {
  components: {
    ServiceEditor
  },
  props: ['app'],
  data () {
    return {
      selectedServiceType: SERVICE_TYPES.rss,
      serviceTypes: SERVICE_TYPES
    }
  }
}
</script>
