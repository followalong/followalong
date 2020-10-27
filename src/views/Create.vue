<template>
  <div class="feed home-feed wide-feed">
    <router-link to="/about" class="button button-gray button-small float-right">
      Add New
    </router-link>

    <div class="title-wrapper">
      <h1>
        <!-- <font-awesome-icon icon="feather" /> -->
        Create
      </h1>
    </div>

    <p>BAM.</p>
  </div>
</template>

<script>
export default {
  props: ['app']
};
</script>
