<template>
  <div class="splash">
    <div class="narrow-container">
      <div class="title-wrapper">
        <h1>
          What is FollowAlong?
        </h1>
      </div>

      <p class="highlight">
        <span v-if="app.loading">FollowAlong is preparing "What's New?" &mdash; just for you!</span>
        <span v-else>All feeds are up-to-date!</span>
      </p>

      <p>
        <strong>FollowAlong is a new way to follow the people and things you care about.</strong>
      </p>

      <ul class="list">
        <li>You own <em>and</em> control <em>all</em> your data.</li>
        <li>You can say <em>anything</em> and follow <em>anyone</em> &mdash; censorship is virtually impossible.</li>
        <li>A less-addictive interface hides the noise and focuses your attention.</li>
        <li>Follow blogs, YouTube channels, and any other RSS-based feed.</li>
        <li>Easily donate, subscribe, and support the people you follow &mdash; directly.</li>
        <li>FollowAlong works offline so you can read articles on the go!</li>
        <li>
          <router-link to="/about" class="link">
            Read more about the technical details.
          </router-link>
        </li>
        <li>
          Or...
          <router-link to="/" class="link">
            Get Started!
          </router-link>
        </li>
      </ul>

      <br><br><br><br><br>

      <div class="first-loading">
        <router-link to="/" class="button button-large" :disabled="app.loading">
          <span v-if="app.loading">Loading Feeds...</span>
          <span v-else>Continue to FollowAlong! &nbsp; &raquo;</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    props: ['app']
};
</script>
