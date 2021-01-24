<template>
  <div class="feed home-feed wide-feed">
    <div class="title-wrapper">
      <button
        v-if="app.unread && app.unread.length"
        class="button-gray button-small float-right"
        @click="catchMeUp()"
      >
        Catch Me Up!
      </button>
      <h1>{{ mediaVerb ? capitalize(mediaVerb) : 'What\'s New?' }}</h1>
    </div>

    <p
      v-if="items.length && !unreadItems.length"
      class="highlight"
    >
      You're all caught up!
    </p>

    <ul
      v-if="items.length"
      class="items"
    >
      <Item
        v-for="item in items"
        :key="item.guid"
        :item="item"
        :app="app"
        show-content="true"
      />
    </ul>

    <p
      v-else
      class="highlight"
    >
      You're all caught up!
    </p>
  </div>
</template>

<script>
import Item from '@/components/item/component.vue'

const VERBS = ['watch', 'read', 'listen']
const DISTANCE_FROM_BOTTOM = 1000
let LOADING

export default {
  components: {
    Item
  },
  props: ['app'],
  data () {
    return {
      limit: 10
    }
  },
  computed: {
    items () {
      var _ = this

      return _.app.newsfeed.filter(function (item) {
        return !_.mediaVerb || item._mediaVerb === _.mediaVerb
      }).slice(0, _.limit)
    },
    unreadItems () {
      return this.items.filter(function (item) {
        return !item.isRead
      })
    },
    mediaVerb () {
      var verb = this.$route.params.media_verb

      if (VERBS.indexOf(verb) === -1) {
        return
      }

      return verb
    }
  },
  watch: {
    $route () {
      this.limit = 10
    }
  },
  mounted () {
    var _ = this

    window.onscroll = function () {
      if (LOADING) {
        return
      }

      var documentHeight = document.body.scrollHeight
      var windowScrolled = Math.max(window.pageYOffset || 0, document.documentElement.scrollTop)

      if (documentHeight - windowScrolled < DISTANCE_FROM_BOTTOM) {
        _.limit += 15

        setTimeout(function () {
          LOADING = false
        }, 100)
      }
    }
  },
  unmounted () {
    window.onscroll = function () {}
  },
  methods: {
    catchMeUp () {
      var _ = this

      _.app.newsfeed.filter(function (item) {
        return !_.mediaVerb || item._mediaVerb === _.mediaVerb
      }).forEach(function (item) {
        item.isRead = true
      })

      _.app.save(_.app.identity)
    },

    capitalize (str) {
      return str[0].toUpperCase() + str.slice(1, str.length)
    }
  }
}
</script>
