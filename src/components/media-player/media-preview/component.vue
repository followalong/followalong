<template>
  <div
    v-if="item.image && item.image.url"
  >
    <img
      :src="item.image.url"
      class="img-preview"
    >
  </div>
  <span
    v-else
    href="javascript:;"
  >&#9658;</span>
</template>

<script>
export default {
  props: ['item']
}
</script>
