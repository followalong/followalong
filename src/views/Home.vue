<template>
    <div class="feed home-feed wide-feed">
        <button v-if="app.unread && app.unread.length" v-on:click="catchMeUp()" class="button-gray button-small float-right">Catch Me Up!</button>
        <h1>{{app.capitalize(mediaVerb)}}</h1>

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
    </div>
</template>

<script>
import Item  from '@/components/item/component.vue';

var VERBS = ['watch', 'read', 'listen'];

export default {
    name: 'home',
    props: ['app'],
    components: {
        Item
    },
    computed: {
        items() {
            var _ = this;

            return _.app.newsfeed.filter(function(item) {
                return item._mediaVerb === _.mediaVerb;
            }).slice(0, 10);
        },
        unreadItems() {
            return this.items.filter(function(item) {
                return !item.isRead;
            });
        },
        mediaVerb() {
            var verb = this.$route.params.media_verb;

            if (VERBS.indexOf(verb) === -1) {
                verb = 'watch';
            }

            return verb;
        }
    },
    methods: {
        catchMeUp() {
            var _ = this;

            _.app.newsfeed.filter(function(item) {
                return item._mediaVerb === _.mediaVerb;
            }).forEach(function(item) {
                item.isRead = true;
            });

            _.app.save();
        }
    }
}
</script>
