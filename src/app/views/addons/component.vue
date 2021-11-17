<template>
  <div class="title-wrapper">
    <h1>Add-ons</h1>
  </div>

  <p>
    External add-ons are not required, but they can improve your experience (eg. better load times, search results, cache images, allow for syncing and publishing, and much more).
  </p>

  <div
    v-for="(addonType, type) in addonTypes"
    :key="`addon-${type}`"
    :title="addonType.shortName"
    class="addon"
  >
    <h2>{{ addonType.name }}</h2>
    <p v-html="addonType.description" />
    <h3>
      <button
        class="button button-small"
        :aria-label="`Change ${addonType.shortName} addon`"
        @click="edit(addonType)"
      >
        Change
      </button>
      <span
        :aria-label="`${addonType.shortName} provider`"
      >
        {{ app.queries.addonForIdentity(app.identity, type).preview() }}
      </span>
    </h3>
  </div>

  <p>
    If you're a developer and are interested in expanding our Add-ons,
    <router-link
      to="/help"
      class="link"
    >
      get in touch.
    </router-link>
  </p>

  <Editor
    v-if="editDetails"
    :app="app"
    :existing="editDetails"
    :close="close"
  />
</template>

<script>
import ADDON_TYPES from './types.js'
import Editor from './editor.vue'

export default {
  components: {
    Editor
  },
  props: ['app'],
  data () {
    return {
      editDetails: null,
      addonTypes: ADDON_TYPES
    }
  },
  methods: {
    edit (addonType) {
      this.editDetails = {
        addonType,
        addon: this.app.queries.addonForIdentity(this.app.identity, addonType.key)
      }
    },
    close () {
      this.editDetails = null
    }
  }
}
</script>
