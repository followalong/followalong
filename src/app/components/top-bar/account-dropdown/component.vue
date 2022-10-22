<template>
  <div v-if="app.identity">
    <a
      class="desktop-only"
    >
      <strong>{{ app.identity.name }}</strong>
    </a>

    <a
      href="javascript:;"
      class="mobile-only"
      @click="app.toggleSidebar()"
    >
      <font-awesome-icon icon="bars" />
    </a>

    <ul>
      <li
        v-for="identity in identities"
        :key="identity.id"
      >
        <a
          href="javascript:;"
          @click="app.setIdentity(identity);"
        >
          {{ identity.name }}
        </a>
      </li>
      <li>
        <router-link
          to="/identities/new"
          aria-label="Add identity"
        >
          + Add Identity
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['app'],
  computed: {
    identities () {
      return this.app.queries.allIdentities()
    }
  }
}
</script>
