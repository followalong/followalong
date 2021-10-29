<template>
  <div class="title-wrapper">
    <h1>Add-ons</h1>
  </div>

  <p>
    External addons are not required, but they can improve load times, search results, cache images, allow for syncing and publishing, and much more.
  </p>

  <div
    v-for="(addonType, key) in addonTypes"
    :key="key"
    :title="addonType.shortName"
    class="addon"
  >
    <h2>{{ addonType.name }}</h2>
    <p v-html="addonType.description" />
    <h3>
      <button
        class="button button-small"
        :aria-label="`Change ${addonType.shortName} addon`"
      >
        Change
      </button>
      FollowAlong Free
    </h3>
  </div>
</template>

<script>
import SERVICE_TYPES from './types.js'

export default {
  props: ['app'],
  data () {
    return {
      selectedAddonType: SERVICE_TYPES.rss,
      addonTypes: SERVICE_TYPES
    }
  }
}
</script>
