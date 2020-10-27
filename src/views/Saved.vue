<template>
  <div class="feed wide-feed">
    <div class="title-wrapper">
      <h1>Saved For Later</h1>
    </div>

    <ul class="items">
      <li
        is="item"
        v-for="item in items"
        :key="item.guid"
        :item="item"
        :app="app"
        showContent="true"
      ></li>
    </ul>
  </div>
</template>

<script>
import Item      from '@/components/item/component.vue';

export default {
  props: ['app'],
  components: {
    Item
  },
  computed: {
    items() {
      return this.app.saved;
    }
  }
};
</script>
