<template>
  <div class="header">
    <div class="container">
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
              :app="app"
              class="identities"
            />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import AccountDropdown from '@/components/top-bar/account-dropdown/component.vue'
import Logo from '@/components/top-bar/logo/component.vue'
import SearchForm from '@/components/top-bar/search-form/component.vue'

export default {
  components: {
    AccountDropdown,
    Logo,
    SearchForm
  },
  props: ['app']
}
</script>
