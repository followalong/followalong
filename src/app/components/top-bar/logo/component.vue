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
    <img
      v-else
      :src="icon"
      class="icon"
    >
    <img
      :src="word"
      class="word desktop-only"
    >
  </a>
</template>

<script>
export default {
  props: ['app'],
  data () {
    return {
      word: '/img/logo-word.svg',
      icon: '/img/logo-icon.svg',
      isLoading: false
    }
  },
  methods: {
    fetchAll () {
      this.isLoading = true
      this.$router.push('/')
      this.app.toggleSidebar(true)

      return this.app.commands.fetchAllFeeds(this.app.identity)
        .finally(() => {
          this.isLoading = false
        })
    }
  }
}
</script>
