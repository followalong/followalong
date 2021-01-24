<template>
  <div :class="'sidebar ' + app.sidebarClass">
    <div
      v-if="app.hintIsShown(app.identity, 'sidebar-about')"
      class="section info-section"
    >
      <h3>
        What is FollowAlong?
        <a
          href="javascript:;"
          class="float-right close-hint"
          @click="app.hideHint(app.identity, 'sidebar-about')"
        >&times;</a>
      </h3>
      <p>
        A place where you can connect <em>directly</em> to things you care about.
        <router-link
          to="/splash"
          class="primary"
        >
          Read more &raquo;
        </router-link>
      </p>
    </div>

    <ul>
      <li>
        <router-link to="/">
          <font-awesome-icon icon="igloo" /> What's New?
          <span class="hint counter">
            <span v-if="app.unread.length">({{ app.unread.length }})</span>
          </span>
        </router-link>
      </li>

      <li>
        <router-link to="/watch">
          <font-awesome-icon icon="film" /> Watch
          <span class="hint counter">
            <span v-if="unreadWatches.length">({{ unreadWatches.length }})</span>
          </span>
        </router-link>
      </li>

      <li>
        <router-link to="/read">
          <font-awesome-icon icon="book-open" />
          Read
          <span class="hint counter">
            <span v-if="unreadReads.length">({{ unreadReads.length }})</span>
          </span>
        </router-link>
      </li>

      <li>
        <router-link to="/listen">
          <font-awesome-icon icon="headphones-alt" />
          Listen
          <span class="hint counter">
            <span v-if="unreadListens.length">({{ unreadListens.length }})</span>
          </span>
        </router-link>
      </li>

      <li v-if="app.saved.length">
        <router-link to="/saved">
          <font-awesome-icon icon="save" />
          Saved
          <span class="hint counter">
            ({{ app.saved.length }})
          </span>
        </router-link>
      </li>

      <li>
        <router-link to="/feeds">
          <font-awesome-icon icon="database" />
          Feeds
          <span class="hint counter">
            <span v-if="app.identity.feeds.length">({{ app.identity.feeds.length }})</span>
          </span>
        </router-link>
      </li>

      <!-- <li>
            <router-link to="/create">
              <font-awesome-icon icon="feather" />
              Create
            </router-link>
        </li> -->

      <li class="divider" />

      <li>
        <router-link to="/services">
          <font-awesome-icon icon="sitemap" />
          Services
        </router-link>
      </li>

      <li>
        <router-link to="/settings">
          <font-awesome-icon icon="cog" />
          Settings
        </router-link>
      </li>

      <li>
        <router-link to="/help">
          <font-awesome-icon icon="question-circle" />
          Help
        </router-link>
      </li>

      <li class="divider mobile-only" />

      <li
        v-for="i in app.nonIdentities"
        :key="i.id"
        class="mobile-only"
      >
        <a
          href="javascript:;"
          @click="app.setIdentity(i);"
        >
          <span v-if="i._decrypted">{{ i.name }}</span>
          <span v-else>{{ i.id.slice(0, 8) }} <span class="encrypted">(not yet decrypted)</span></span>
        </a>
      </li>

      <li class="mobile-only">
        <router-link to="/identities/new">
          + Add Identity
        </router-link>
      </li>

      <li class="divider" />
    </ul>

    <div class="section">
      <h3>
        <router-link to="/changelog">
          Version {{ version }}
        </router-link>
      </h3>
    </div>
  </div>
</template>

<script>
import changelog from '@/../changelog.json'

export default {
  props: ['app'],
  data () {
    return {
      version: Object.keys(changelog)[0]
    }
  },
  computed: {
    unreadWatches () {
      return this.app.unread.filter((item) => item.mediaVerb === 'watch')
    },
    unreadListens () {
      return this.app.unread.filter((item) => item.mediaVerb === 'listen')
    },
    unreadReads () {
      return this.app.unread.filter((item) => item.mediaVerb === 'read')
    }
  },
  watch: {
    '$route' (to, from) {
      const _ = this
      _.app.toggleSidebar(true)
    }
  }
}
</script>
