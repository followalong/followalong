<template>
  <div :class="'sidebar ' + app.sidebarClass">
    <div
      v-if="app.queries.hintIsShown(app.identity, 'sidebar-about')"
      class="section info-section"
    >
      <h3>
        What is FollowAlong?
        <a
          href="javascript:;"
          class="float-right close-hint"
          @click="app.commands.hideHint(app.identity, 'sidebar-about')"
        >&times;</a>
      </h3>
      <p>
        A place where you can connect <em>directly</em> to things you care about.
      </p>
      <router-link
        aria-label="About FollowAlong"
        to="/about"
        class="primary"
      >
        Read more &raquo;
      </router-link>
    </div>

    <ul>
      <li>
        <router-link
          to="/"
          aria-label="What's new?"
        >
          <font-awesome-icon icon="igloo" /> What's New?
          <span class="hint counter">
            <span v-if="unread.length">({{ unread.length }})</span>
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

      <li v-if="saved.length">
        <router-link
          to="/saved"
          aria-label="Saved"
        >
          <font-awesome-icon icon="save" />
          Saved
          <span class="hint counter">
            ({{ saved.length }})
          </span>
        </router-link>
      </li>

      <li>
        <router-link
          to="/feeds"
          aria-label="Feeds"
        >
          <font-awesome-icon icon="database" />
          Feeds
          <span class="hint counter">
            <span v-if="feeds.length">({{ feeds.length }})</span>
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
        <router-link
          to="/addons"
          aria-label="Addons"
        >
          <font-awesome-icon icon="sitemap" />
          Add-ons
        </router-link>
      </li>

      <li>
        <router-link
          to="/settings"
          aria-label="Settings"
        >
          <font-awesome-icon icon="cog" />
          Settings
        </router-link>
      </li>

      <li>
        <router-link
          to="/help"
          aria-label="Help"
        >
          <font-awesome-icon icon="question-circle" />
          Help
        </router-link>
      </li>

      <li class="divider mobile-only" />

      <li
        v-for="i in nonIdentities"
        :key="i.id"
        class="mobile-only"
      >
        <a
          href="javascript:;"
          @click="app.setIdentity(app, i);"
        >
          <span>{{ i.name || 'My Account' }}</span>
        </a>
      </li>

      <!-- <li class="mobile-only">
        <router-link to="/identities/new">
          + Add Identity
        </router-link>
      </li> -->

      <li class="divider" />
    </ul>

    <div class="section">
      <h3>
        <router-link
          to="/changelog"
          aria-label="See the changelog"
        >
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
      return this.unread.filter(this.app.queries.isWatchable)
    },
    unreadListens () {
      return this.unread.filter(this.app.queries.isListenable)
    },
    unreadReads () {
      return this.unread.filter(this.app.queries.isReadable)
    },
    saved () {
      return this.app.queries.itemsForIdentity(this.app.identity).filter(this.app.queries.isSaved)
    },
    unread () {
      return this.app.queries.itemsForIdentity(this.app.identity).filter(this.app.queries.isUnread)
    },
    feeds () {
      return this.app.queries.feedsForIdentity(this.app.identity)
    },
    nonIdentities () {
      return this.app.queries.allIdentities().filter((i) => i.id === this.app.identity.id)
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
