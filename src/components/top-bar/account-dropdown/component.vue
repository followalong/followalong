<template>
  <div>
    <a class="desktop-only">
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
      <li v-if="!app.nonIdentities.length">
        <router-link to="/settings">
          Settings
        </router-link>
      </li>
      <li
        v-for="i in app.nonIdentities"
        :key="i.id"
      >
        <a
          href="javascript:;"
          @click="app.setIdentity(i);"
        >
          <span v-if="i._decrypted">{{ i.name }}</span>
          <span v-else>{{ i.id.slice(0, 8) }} <span class="encrypted">(not yet decrypted)</span></span>
        </a>
      </li>
      <li>
        <router-link to="/identities/new">
          + Add Identity
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['app']
}
</script>
