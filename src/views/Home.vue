<template>
    <div class="feed home-feed wide-feed">
        <button v-if="app.unread && app.unread.length" v-on:click="app.catchMeUp()" class="button-gray button-small float-right">Catch Me Up!</button>
        <h1>What's New?</h1>

        <p v-if="items && !items.length">
            <span v-if="app.loading">
                <font-awesome-icon icon="spinner" spin /> &nbsp;
                Loading...
            </span>
            <span v-else>
                You're all caught up!
            </span>
        </p>

        <ul class="items" v-else>
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

export default {
    name: 'home',
    props: ['app'],
    components: {
        Item
    },
    computed: {
        items() {
            return this.app.newsfeed.slice(0, 10);
        }
    }
}
</script>
