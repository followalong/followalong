<template>
  <div class="feed wide-feed">
    <h1>Saved For Later</h1>
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
  name: 'feed',
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
