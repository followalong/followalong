<template>
  <div
    v-if="item.image && item.image.url"
  >
    <div class="aspect-ratio-box">
      <img
        class="aspect-ratio-box-inside"
        :style="'background-image:url(' + item.image.url + ')'"
      >
    </div>
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
