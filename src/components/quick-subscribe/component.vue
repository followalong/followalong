<template>
  <a v-if="app.isMemberable(feed)" v-on:click="app.editMembership(feed, 'register')" href="javascript:;" :class="app.membershipClass(feed) + ' quick-subscribe'" title="Membership">
    <font-awesome-icon icon="id-card-alt" class="i" />
  </a>
</template>

<script>
export default {
  props: ['app', 'feed']
};
</script>
