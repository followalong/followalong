<template>
  <a
    href="javascript:;"
    aria-label="FollowAlong"
    @click="fetchAll"
  >
    <font-awesome-icon
      v-if="isLoading"
      icon="spinner"
      spin
      class="loader"
    />
    <span v-else>
      <img :src="logo">
      <img :src="mobileLogo">
    </span>
  </a>
</template>

<script>
export default {
  props: ['app'],
  data () {
    return {
      logo: '/img/logo-white.svg',
      mobileLogo: '/img/favicon-white.svg',
      isLoading: false
    }
  },
  methods: {
    fetchAll () {
      this.isLoading = true
      this.$router.push('/')
      this.app.toggleSidebar(true)

      this.app.commands.fetchAllFeeds(this.app.identity)
        .finally(() => {
          this.isLoading = false
        })
    }
  }
}
</script>
