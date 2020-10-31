<template>
  <form
    method="GET"
    action="/search"
    @submit.prevent="search(q)"
  >
    <input
      v-model="q"
      type="text"
      name="q"
      autocomplete="off"
      placeholder="Search..."
    >
  </form>
</template>

<script>
export default {
  data () {
    return {
      q: this.$route.query.q || ''
    }
  },

  methods: {
    search (q) {
      this.$router.push({ path: '/search', query: { q: this.q } })
    }
  }
}
</script>
