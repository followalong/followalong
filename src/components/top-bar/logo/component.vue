<template>
  <a
    href="javascript:;"
    @click="fetchAll"
  >
    <font-awesome-icon
      v-if="app.loading"
      icon="spinner"
      spin
      class="loader"
    />
    <img
      v-if="!app.loading"
      :src="logo"
    >
    <img
      v-if="!app.loading"
      :src="mobileLogo"
    >
  </a>
</template>

<script>
export default {
  props: ['app'],
  data () {
    return {
      logo: '/img/logo-white.svg',
      mobileLogo: '/img/favicon-white.svg'
    }
  },
  methods: {
    fetchAll () {
      this.$router.push('/')
      this.app.toggleSidebar(true)
      this.app.fetchAllFeeds(this.app.identity, true)
    }
  }
}
</script>
