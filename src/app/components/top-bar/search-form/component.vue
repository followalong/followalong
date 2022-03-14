<template>
  <form
    method="GET"
    action="/search"
    aria-label="Search form"
    @submit.prevent="search(q)"
  >
    <input
      v-model="q"
      aria-label="Search query"
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
      return this.$router.push({ path: '/search', query: { q: this.q } })
    }
  }
}
</script>
