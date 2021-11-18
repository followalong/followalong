<template>
  <router-link
    to="/"
    aria-label="FollowAlong"
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
  </router-link>
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
  }
}
</script>
