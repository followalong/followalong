<template>
  <div class="search">
    <h1>
      Search:
      <strong>{{app.q}}</strong>
    </h1>

    <p v-if="invalidURL">Invalid URL.</p>

    <div v-else>
      <p v-if="app.loading">
        Loading...
      </p>
      <div v-else>
        <div v-if="feed">
          <div v-if="feed.error">
            {{feed.error.message}}
          </div>
          <div v-if="items && items.length">
            <button v-on:click="app.subscribe(feed, items)">Subscribe</button>

            <ul class="items">
              <li
                is="item"
                v-for="item in items"
                :key="item.guid"
                :app="app"
                :item="item"
              ></li>
            </ul>
          </div>
          <p v-else>No items found.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Item      from '@/components/item/component.vue';

function qChange() {
  var _ = this;

  if (_.app.isURL(_.app.q)) {
    _.invalidURL = false;
    _.items = [];
    _.app.fetchURL(_.app.q, _.items, _);
  } else {
    _.invalidURL = true;
  }
}

export default {
  name: 'search',
  props: ['app'],
  components: {
    Item
  },
  data: function() {
    return {
        invalidURL: false,
        items: [],
        feed: undefined
    };
  },
  created() {
    qChange.call(this);
  },
  watch: {
    'app.q': qChange
  }
};
</script>
