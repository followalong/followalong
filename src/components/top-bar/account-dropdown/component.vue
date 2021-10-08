<template>
  <div v-if="app.identity">
    <router-link
      v-if="!otherIdentities.length"
      to="/settings"
      class="desktop-only"
    >
      Settings
    </router-link>
    <a
      v-else
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

    <ul v-if="otherIdentities.length">
      <li
        v-for="identity in otherIdentities"
        :key="identity.id"
      >
        <a
          href="javascript:;"
          @click="app.setIdentity(identity);"
        >
          <span v-if="identity._decrypted">{{ identity.name }}</span>
          <span v-else>{{ identity.id.slice(0, 8) }} <span class="encrypted">(not yet decrypted)</span></span>
        </a>
      </li>
      <!-- <li>
        <router-link to="/identities/new">
          + Add Identity
        </router-link>
      </li> -->
    </ul>
  </div>
</template>

<script>
export default {
  props: ['app'],
  computed: {
    otherIdentities () {
      return this.app.state.findAll('identities', (i) => i.id !== this.app.identity.id)
    }
  }
}
</script>
