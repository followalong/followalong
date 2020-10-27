<template>
    <div class="feed home-feed wide-feed">
        <div class="title-wrapper">
            <button v-if="app.unread && app.unread.length" v-on:click="catchMeUp()" class="button-gray button-small float-right">Catch Me Up!</button>
            <h1>{{mediaVerb ? app.capitalize(mediaVerb) : 'What\'s New?'}}</h1>
        </div>

        <p v-if="items.length && !unreadItems.length" class="highlight">
            You're all caught up!
        </p>

        <ul class="items" v-if="items.length">
            <li
                is="item"
                v-for="item in items"
                :key="item.guid"
                :item="item"
                :app="app"
                showContent="true"
            ></li>
        </ul>

        <p v-else class="highlight">
            You're all caught up!
        </p>
    </div>
</template>

<script>
import Item  from '@/components/item/component.vue';

var VERBS = ['watch', 'read', 'listen'],
    DISTANCE_FROM_BOTTOM = 1000,
    LOADING;

export default {
    props: ['app'],
    data() {
        return {
            limit: 10
        };
    },
    components: {
        Item
    },
    watch: {
        $route () {
            this.limit = 10;
        }
    },
    computed: {
        items() {
            var _ = this;

            return _.app.newsfeed.filter(function(item) {
                return !_.mediaVerb || item._mediaVerb === _.mediaVerb;
            }).slice(0, _.limit);
        },
        unreadItems() {
            return this.items.filter(function(item) {
                return !item.isRead;
            });
        },
        mediaVerb() {
            var verb = this.$route.params.media_verb;

            if (VERBS.indexOf(verb) === -1) {
                return;
            }

            return verb;
        }
    },
    methods: {
        catchMeUp() {
            var _ = this;

            _.app.newsfeed.filter(function(item) {
                return !_.mediaVerb || item._mediaVerb === _.mediaVerb;
            }).forEach(function(item) {
                item.isRead = true;
            });

            _.app.save();
        }
    },
    mounted() {
        var _ = this;

        window.onscroll = function() {
            if (LOADING) {
                return;
            }

            var documentHeight = document.body.scrollHeight,
                windowScrolled = Math.max(window.pageYOffset || 0, document.documentElement.scrollTop);

            if (documentHeight - windowScrolled < DISTANCE_FROM_BOTTOM) {
                _.limit += 10;

                setTimeout(function() {
                    LOADING = false;
                }, 100);
            }
        };
    },
    destroyed() {
        window.onscroll = function() {};
    }
}
</script>
