<template>
  <div class="title-wrapper">
    <router-link
      to="/about"
      class="button button-gray button-small float-right"
    >
      What is FollowAlong?
    </router-link>

    <h1>Changelog</h1>
  </div>

  <p class="highlight">
    <strong>Why isn't FollowAlong open source?</strong><br>
    Because of its current quick evolution and changes, we've decided to keep it closed &mdash; for now.
    If you don't trust us (and you shouldn't), FollowAlong is just HTML, JS, and CSS. This means that all the source code and remote requests can already be audited.
    Ultimately, FollowAlong will be released to open source once we settle on a more stable implementation.
  </p>

  <div
    v-for="(summary, version) in changelog"
    :key="version"
  >
    <p>
      <strong>Version {{ version }}</strong><br>
      {{ summary }}
    </p>

    <hr>
  </div>
</template>

<script>
import changelog from '@/../changelog.json'

export default {
  props: ['app'],
  data () {
    return {
      changelog
    }
  }
}
</script>
