<template>
  <div class="splash">
    <div class="narrow-container">
      <div class="title-wrapper">
        <h1>
          What is FollowAlong?
        </h1>
      </div>

      <p class="highlight">
        <span v-if="app.identity.isLoading">FollowAlong is preparing "What's New?" &mdash; just for you!</span>
        <span v-else>All feeds are up-to-date!</span>
      </p>

      <p>
        <strong>FollowAlong is a new way to follow the people and things you care about.</strong>
      </p>

      <ul class="list">
        <li>Follow blogs, YouTube channels, calendars, participate in groups, and anything else with an RSS-based feed.</li>
        <li>Because you interact with your feeds <em>directly</em> &mdash; censorship is virtually impossible.</li>
        <li>Easily donate or subscribe to the feeds you follow.</li>
        <li>You own <em>and</em> control <em>all</em> your data &mdash; it stays in-browser.</li>
        <li>A less-addictive interface hides the noise and focuses your attention.</li>
        <li>FollowAlong works offline so you can read articles on the go!</li>
        <li>
          <router-link
            to="/about"
            class="link"
          >
            Read more about the technical details.
          </router-link>
        </li>
        <li>
          Or...
          <router-link
            to="/"
            class="link"
          >
            dig in!
          </router-link>
        </li>
      </ul>

      <br><br><br><br><br>

      <div class="first-loading">
        <router-link
          to="/"
          class="button button-large"
          :disabled="app.identity.isLoading"
        >
          <span v-if="app.identity.isLoading">Loading Feeds...</span>
          <span v-else>Continue to FollowAlong! &nbsp; &raquo;</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['app']
}
</script>
