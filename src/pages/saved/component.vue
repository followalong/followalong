<template>
  <div class="feed wide-feed">
    <div class="title-wrapper">
      <h1>Saved For Later</h1>
    </div>

    <ul class="items">
      <Item
        v-for="item in items"
        :key="item.guid"
        :item="item"
        :app="app"
        show-content="true"
      />
    </ul>
  </div>
</template>

<script>
import Item from '@/components/item/component.vue'

export default {
  components: {
    Item
  },
  props: ['app'],
  computed: {
    items () {
      return this.app.saved
    }
  }
}
</script>
