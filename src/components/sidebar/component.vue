<template>
  <div class="sidebar">
    <ul>
        <li>
          <router-link to="/">
              <strong>
                What's New?
                <!-- <span v-if="identity.unread.length">({{identity.unread.length}})</span> -->
              </strong>
          </router-link>
        </li>

        <li v-if="app.api">
            <router-link to="/discover">
              Discover
            </router-link>
        </li>

        <li>
            <router-link to="/subscriptions">
              Subscriptions
            </router-link>
        </li>

        <li v-if="app.saved.length">
            <router-link to="/saved">
              Saved For Later
            </router-link>
        </li>

        <li v-if="app.api">
          <router-link to="/messages">
            Messages
          </router-link>
        </li>

        <li>
            <router-link to="/about">
              About
            </router-link>
        </li>

        <li>
          <router-link to="/settings">
            Setup
          </router-link>
        </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  props: ['app']
}
</script>
