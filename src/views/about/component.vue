<template>
  <div class="title-wrapper">
    <h1>
      Our Story
    </h1>
  </div>

  <p class="highlight">
    <span v-if="app.identity.isLoading">FollowAlong is preparing "What's New?" &mdash; just for you!</span>
    <span v-else>All feeds are up-to-date!</span>
  </p>

  <Info />
</template>

<script>
import Info from './info.vue'

export default {
  components: {
    Info
  },
  props: ['app'],
  data () {
    return {
      readMore: false
    }
  }
}
</script>
