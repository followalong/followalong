<template>
  <div :class="'sidebar ' + app.sidebarClass">
    <ul>
        <li>
          <router-link to="/">
              <font-awesome-icon icon="igloo" /> What's New?
              <span class="hint counter">
                <span v-if="app.unread.length">({{app.unread.length}})</span>
                <!-- <span v-else>&check;</span> -->
              </span>
          </router-link>
        </li>

        <li>
          <router-link to="/watch">
              <font-awesome-icon icon="film" /> Watch
              <span class="hint counter">
                <span v-if="app.unreadWatches.length">({{app.unreadWatches.length}})</span>
                <!-- <span v-else>&check;</span> -->
              </span>
          </router-link>
        </li>

        <li>
          <router-link to="/read">
              <font-awesome-icon icon="book-open" />
              Read
              <span class="hint counter">
                <span v-if="app.unreadReads.length">({{app.unreadReads.length}})</span>
                <!-- <span v-else>&check;</span> -->
              </span>
          </router-link>
        </li>

        <li>
          <router-link to="/listen">
              <font-awesome-icon icon="headphones-alt" />
              Listen
              <span class="hint counter">
                <span v-if="app.unreadListens.length">({{app.unreadListens.length}})</span>
                <!-- <span v-else>&check;</span> -->
              </span>
          </router-link>
        </li>

        <li class="divider"></li>

        <li v-if="app.saved.length">
            <router-link to="/saved">
              <font-awesome-icon icon="save" />
              Saved
              <span class="hint counter">
                ({{app.saved.length}})
              </span>
            </router-link>
        </li>

        <li v-if="app.api">
            <router-link to="/discover">
              <!-- Discover -->
            </router-link>
        </li>

        <li>
            <router-link to="/subscriptions">
              <font-awesome-icon icon="database" />
              Subscriptions
              <span class="hint counter">
                <span v-if="app.feeds.length">({{app.feeds.length}})</span>
              </span>
            </router-link>
        </li>

        <li>
            <router-link to="/settings">
              <font-awesome-icon icon="cog" />
              Settings
            </router-link>
        </li>

        <li class="divider"></li>
    </ul>

    <div class="section info-section" v-if="app.hintIsShown('sidebar-about')">
      <h3>
        What is FollowAlong?
        <a href="javascript:;" class="float-right close-hint" v-on:click="app.hideHint('sidebar-about')">&times;</a>
      </h3>
      <p>
        A social network where voices <em>can't</em> be censored and your data is kept safe with <em>you</em>.
        <router-link to="/about" class="primary">
          Read more &raquo;
        </router-link>
      </p>
    </div>

    <div class="section">
      <h3>
        <router-link to="/updates">
          Version {{app.version}}
        </router-link>
      </h3>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  props: ['app'],
  watch: {
    '$route' (to, from) {
      var _ = this;
      _.app.toggleSidebar(true);
    }
  }
}
</script>
