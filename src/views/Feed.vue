<template>
  <div v-if="feed">
    <div class="feed wide-feed">
      <div class="title-wrapper">
        <h1>
          <a v-on:click="showMenu = !showMenu" href="javascript:;" class="float-right">
            <font-awesome-icon icon="bars" class="i" />
          </a>

          <QuickSubscribe :app="app" :feed="feed" class="float-right" />

          <router-link :to="{ name: 'feed', params: { feed_url: feed.url } }">
            {{feed.name}}
          </router-link>

          <font-awesome-icon v-if="feed.loading" icon="spinner" spin class="i" />

          <a v-else v-on:click="pause()" href="javascript:;" class="i">
            <span v-if="feed.paused">&#10074;&#10074;</span>
            <span v-else>&#9658;</span>
          </a>
        </h1>

        <!-- <a :href="feed.url" class="hint">
          {{feed.url}}
        </a> -->

        <ul v-if="showMenu" class="actions">
          <li v-if="unreadItems.length">
            <a href="javascript:;" v-on:click="catchFeedUp()">
              Catch Me Up!
            </a>
          </li>
          <li>
            <a href="javascript:;" v-on:click="fetch()">
              <span v-if="feed.loading">Fetching...</span>
              <span v-else>Fetch Now</span>
            </a>
          </li>
          <li v-if="app.isMemberable(feed) && !app.isMember(feed)">
            <a href="javascript:;" v-on:click="showMenu = false; app.editMembership(feed, 'register')">
              Become a Member
            </a>
          </li>
          <li v-if="app.isMemberable(feed) && !app.isMember(feed)">
            <a href="javascript:;" v-on:click="showMenu = false; app.editMembership(feed, 'login')">
              Login as Member
            </a>
          </li>
          <li v-if="app.isMember(feed)">
            <a href="javascript:;" v-on:click="showMenu = false; app.editMembership(feed, 'renew')">
              Renew Membership
            </a>
          </li>
          <li v-if=" app.isHelpable(feed)">
            <a href="javascript:;" v-on:click="showMenu = false; app.editMembership(feed, 'support')">
              Member Support
            </a>
          </li>
          <li v-if="app.isMember(feed)">
            <a href="javascript:;" v-on:click="showMenu = false; app.editMembership(feed, 'password')">
              Change Member Password
            </a>
          </li>
          <li v-if="app.isMember(feed)">
              <a href="javascript:;" v-on:click="showMenu = false; app.editMembership(feed, 'logout')">
                Logout as Member
              </a>
          </li>
          <li>
            <a href="javascript:;" v-on:click="showMenu = false; app.unsubscribe(feed, true)">
              Unsubscribe
            </a>
          </li>
        </ul>
      </div>

      <ul class="items">
        <li v-if="items.length === 0">
          <h3>You're all caught up!</h3>
          <p>
            If you want to be able to see more "history", visit the <router-link to="/settings" class="link">Settings</router-link> page and increase the maximum number of items to keep.
          </p>
        </li>

        <!-- <li v-if="app.isMemberExpired(feed)" :class="'warning ' + app.membershipClass(feed) + '-background'">
          <p>
            Your membership has expired.
          </p>

          <p>
            <a href="javascript:;" v-on:click="app.editMembership(feed, 'register')">
              Renew Now
            </a>

            &nbsp; <span class="hint inline">-</span> &nbsp;

            <a href="javascript:;">
              Cancel
            </a>
          </p>
        </li> -->

        <li
          is="item"
          v-for="item in items"
          :key="item.guid"
          :item="item"
          :app="app"
          showContent="true"
        ></li>
      </ul>

    </div>
  </div>
</template>

<script>
import Item           from '@/components/item/component.vue';
import QuickSubscribe from '@/components/quick-subscribe/component.vue';
import sorter         from '@/components/app/sorter';

export default {
  props: ['app'],
  components: {
    Item,
    QuickSubscribe
  },
  data() {
    return {
      showMenu: false
    };
  },
  computed: {
    feed() {
      var _ = this;

      if (!_.app.identity.feeds) return;

      return _.app.identity.feeds.find(function(feed) {
          return feed.url + '' === _.$route.params.feed_url + '';
      });
    },
    unreadItems() {
      var _ = this;

      return _.items.filter(function(item) {
        return !item.isRead;
      });
    },
    items() {
      var _ = this;

      return (_.app.newsfeed || []).filter(function(item) {
        return item.feedURL === _.feed.url;
      }).sort(sorter(_.app.identity));
    }
  },
  methods: {
    catchFeedUp() {
      var _ = this;

      for (var i = _.items.length - 1; i >= 0; i--) {
        _.items[i].isRead = true;
      }

      _.app.save();
    },

    pause() {
      var _ = this;

      _.feed._updatedAt = Date.now();
      _.feed.paused = !_.feed.paused;
      _.app.save();
    },

    fetch() {
      var _ = this;

      _.app.fetchFeed(_.app.identity, _.feed, Date.now(), true, function() {
        _.app.save();
      });
    }
  }
};
</script>
