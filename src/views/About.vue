<template>
  <div class="narrow-container">
    <h1>
      <span v-if="app.loading">
        <font-awesome-icon icon="spinner" spin v-if="app.loading" /> &nbsp;
        Loading...
      </span>
      <span v-else>What is FollowAlong?</span>
    </h1>

    <p class="highlight">
      <span v-if="app.loading">FollowAlong is preparing "What's New?" &mdash; just for you!</span>
      <span v-else>All feeds are up-to-date!</span>
    </p>

    <About />

    <p><br><br></p>

    <div class="first-loading">
      <router-link to="/" class="button" :disabled="app.loading">
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
  }
};
</script>
