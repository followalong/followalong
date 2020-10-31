<template>
  <div class="header">
    <div class="nav table">
      <ul class="table-row">
        <li class="table-cell logo">
          <Logo :app="app" />
        </li>
        <li class="table-cell search">
          <SearchForm />
        </li>
        <li class="table-cell">
          <AccountDropdown
            v-if="app.identity && app.identity._decrypted"
            :app="app"
            class="identities"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import AccountDropdown from '@/components/account-dropdown/component.vue'
import Logo from '@/components/logo/component.vue'
import SearchForm from '@/components/search-form/component.vue'

export default {
  components: {
    AccountDropdown,
    Logo,
    SearchForm
  },
  props: ['app']
}
</script>
