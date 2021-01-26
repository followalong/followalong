<template>
  <div v-if="feed">
    <div class="feed wide-feed">
      <div class="title-wrapper">
        <h1>
          <a
            href="javascript:;"
            class="float-right"
            @click="showMenu = !showMenu"
          >
            <font-awesome-icon
              icon="bars"
              class="i"
            />
          </a>

          <router-link :to="{ name: 'feed', params: { feed_url: feed.url } }">
            {{ feed.name }}
          </router-link>

          <font-awesome-icon
            v-if="feed.loading"
            icon="spinner"
            spin
            class="i"
          />

          <a
            v-else
            href="javascript:;"
            class="i"
            @click="pause()"
          >
            <span v-if="feed.paused">&#10074;&#10074;</span>
            <span v-else>&#9658;</span>
          </a>
        </h1>

        <!-- <a :href="feed.url" class="hint">
          {{feed.url}}
        </a> -->

        <ul
          v-if="showMenu"
          class="actions"
          @click="showMenu = false"
        >
          <li v-if="unreadItems.length">
            <a
              href="javascript:;"
              @click="catchFeedUp()"
            >
              Catch Me Up!
            </a>
          </li>
          <li>
            <a
              href="javascript:;"
              @click="fetch()"
            >
              <span v-if="feed.loading">Fetching...</span>
              <span v-else>Fetch Now</span>
            </a>
          </li>
          <li>
            <a
              href="javascript:;"
              @click="showMenu = false; app.unsubscribeFeed(app, app.identity, feed, true)"
            >
              Unsubscribe
            </a>
          </li>
        </ul>
      </div>

      <ul class="items">
        <li v-if="items.length === 0">
          <h3>You're all caught up!</h3>
          <p>
            If you want to be able to see more "history", visit the <router-link
              to="/settings"
              class="link"
            >
              Settings
            </router-link> page and increase the maximum number of items to keep.
          </p>
        </li>

        <Item
          v-for="item in items"
          :key="item.guid"
          :item="item"
          :app="app"
          show-content="true"
        />
      </ul>
    </div>
  </div>
</template>

<script>
import Item from '@/components/item/component.vue'
import sorter from '@/components/app/sorter'

export default {
  components: {
    Item
  },
  props: ['app'],
  data () {
    return {
      showMenu: false
    }
  },
  computed: {
    feed () {
      var _ = this

      if (!_.app.identity.feeds) return

      return _.app.identity.feeds.find(function (feed) {
        return feed.url + '' === _.$route.params.feed_url + ''
      })
    },
    unreadItems () {
      var _ = this

      return _.items.filter(function (item) {
        return !item.isRead
      })
    },
    items () {
      var _ = this

      return (_.app.newsfeed || []).filter(function (item) {
        return item.feedURL === _.feed.url
      }).sort(sorter(_.app.identity))
    }
  },
  methods: {
    catchFeedUp () {
      var _ = this

      for (var i = _.items.length - 1; i >= 0; i--) {
        _.items[i].isRead = true
      }

      _.app.identity.save()
    },

    pause () {
      var _ = this

      _.feed._updatedAt = Date.now()
      _.feed.paused = !_.feed.paused
      _.app.identity.save()
    },

    fetch () {
      var _ = this

      _.feed.fetch(_.app, Date.now(), true, function () {
        _.app.identity.save()
      })
    }
  }
}
</script>
