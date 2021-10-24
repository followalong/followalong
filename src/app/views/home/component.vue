<template>
  <div class="feed home-feed wide-feed">
    <div class="title-wrapper">
      <button
        v-if="hasUnreadItems"
        class="button-gray button-small float-right"
        aria-label="Catch up on all"
        @click="app.commands.catchMeUp(app.identity, items)"
      >
        Catch Me Up!
      </button>
      <h1>{{ mediaVerb ? capitalize(mediaVerb) : 'What\'s New?' }}</h1>
    </div>

    <ul
      v-if="itemsWithLimit.length"
      class="items"
    >
      <Item
        v-for="item in itemsWithLimit"
        :key="item.id"
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
import Item from '@/app/components/item/component.vue'

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
      let items = this.app.queries.itemsForIdentity(this.app.identity)

      if (this.mediaVerb === 'watch') {
        items = items.filter(this.app.queries.isWatchable)
      } else if (this.mediaVerb === 'listen') {
        items = items.filter(this.app.queries.isListenable)
      } else if (this.mediaVerb === 'read') {
        items = items.filter(this.app.queries.isReadable)
      }

      return items
    },
    itemsWithLimit () {
      return this.items.slice(0, this.limit)
    },
    hasUnreadItems () {
      return this.items.filter(this.app.queries.isUnread).length
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
    capitalize (str) {
      return str[0].toUpperCase() + str.slice(1, str.length)
    }
  }
}
</script>