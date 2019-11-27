<template>
  <div class="narrow-container">
    <div class="title-wrapper">
      <h1>
        Our Story
      </h1>
    </div>

    <p class="highlight">
      <span v-if="app.loading">FollowAlong is preparing "What's New?" &mdash; just for you!</span>
      <span v-else>All feeds are up-to-date!</span>
    </p>

    <About />

    <p><br></p>

    <div class="first-loading">
      <router-link to="/" class="button button-large" :disabled="app.loading">
        <span v-if="app.loading">Loading Feeds...</span>
        <span v-else>Continue to FollowAlong! &nbsp; &raquo;</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import About from '@/components/about/component.vue';

export default {
  name: 'about',
  props: ['app'],
  components: {
    About
  },
  data() {
    return {
      readMore: false
    };
  }
};
</script>
