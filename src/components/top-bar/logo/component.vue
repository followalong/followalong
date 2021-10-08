<template>
  <a
    href="javascript:;"
    @click="fetchAll"
  >
    <font-awesome-icon
      v-if="!app.identity"
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
      mobileLogo: '/img/favicon-white.svg'
    }
  },
  methods: {
    fetchAll () {
      this.$router.push('/')
      this.app.toggleSidebar(true)
      this.app.commands.fetchAllFeeds(this.app.identity)
    }
  }
}
</script>
