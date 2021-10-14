<template>
  <div class="title-wrapper">
    <h1>
      Our Story
    </h1>
  </div>

  <Info />
</template>

<script>
import Info from './info.vue'

export default {
  components: {
    Info
  },
  props: ['app'],
  data () {
    return {
      readMore: false
    }
  }
}
</script>
