<template>
  <a
    v-if="app.isMemberable(feed)"
    href="javascript:;"
    :class="app.membershipClass(feed) + ' quick-subscribe'"
    title="Membership"
    @click="app.editMembership(feed, 'register')"
  >
    <font-awesome-icon
      icon="id-card-alt"
      class="i"
    />
  </a>
</template>

<script>
export default {
  props: ['app', 'feed']
}
</script>
