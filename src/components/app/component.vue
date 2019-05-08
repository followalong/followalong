<template>
    <div id="app">
        <MediaPlayer :app="app" :playing="playing" v-if="playing" />

        <div class="header">
            <div class="nav table">
                <ul class="table-row">
                    <li class="table-cell logo">
                        <a href="javascript:;" v-on:click="$router.push('/'); fetchAllFeeds(identity, true)">
                            <font-awesome-icon icon="spinner" spin v-if="loading" />
                            <img :src="logo" v-if="!loading">
                        </a>
                    </li>
                    <li class="table-cell search">
                        <form method="GET" action="/search" v-on:submit="search">
                            <input type="text" name="q" v-model="q" autocomplete="off" placeholder="Enter a URL to follow...">
                        </form>
                    </li>
                    <li v-if="identity" class="table-cell">
                        <router-link to="/settings">
                                <strong>{{ identity.name }}</strong>
                        </router-link>

                        <ul class="identities">
                            <li v-for="i in nonIdentities" :key="i.id">
                                <a href="javascript:;" v-on:click="app.setIdentity(i);">
                                    <span v-if="i._decrypted">{{i.name}}</span>
                                    <span v-else>{{i.id.slice(0, 8)}} <span class="encrypted">(not yet decrypted)</span></span>
                                </a>
                            </li>
                            <li>
                                <router-link to="/identities/new">
                                    + Add Identity
                                </router-link>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>

        <div class="content">
            <Sidebar :app="app" />
            <div v-if="identity">
                <router-view :app="app" />
            </div>
            <div v-else>
                <p>Securely loading your data...</p>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
@import "./index.scss";
</style>

<script>
import Sidebar       from '@/components/sidebar/component.vue';
import MediaPlayer   from '@/components/media-player/component.vue';
import seed          from '@/components/app/seed';
import sorter        from '@/components/app/sorter';
import methods       from '@/components/app/methods';
import localForage   from 'localforage';

function SORT_BY_NAME(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
}

export default {
    components: {
        Sidebar,
        MediaPlayer
    },
    data: function() {
        var _ = this;

        window.app = _;

        return {
            app: _,
            logo: window.logo || '/img/logo.svg',
            q: _.$route.query.q || '',
            api: false,
            store: localForage.createInstance({
                name: 'commmunity'
            }),
            loading: true,
            identities: [],
            keychain: {},
            identity: {},
            proxies: window.servers.filter(function(server) {
                return typeof server.fetchURL === 'function';
            }),
            remotes: window.servers.filter(function(server) {
                return typeof server.getIdentity === 'function' && typeof server.setIdentity === 'function';
            }),
            publishers: window.servers.filter(function(server) {
                return typeof server.publishItem === 'function';
            }),
            playing: undefined,
        };
    },
    mounted() {
        var _ = this;

        _.$on('loading', function(bool) {
            _.loading = bool;
        });

        _.constructIdentities(function(identities, keychain) {
            _.keychain = keychain;

            if (!identities || !identities.length) {
                identities = seed;
                _.$router.push('about');
            }

            for (var i = identities.length - 1; i >= 0; i--) {
                _.setIdentityDefaults(identities[i]);
            }

            _.identities = identities;
            _.app.setIdentity(identities[0]);
        });
    },
    computed: {
        nonIdentities() {
            var _ = this;

            return _.app.identities.filter(function(i) {
                return i.id !== _.identity.id;
            });
        },
        newsfeed() {
            var _ = this;

            if (!_.identity) return [];

            return (_.identity.items || []).sort(sorter(_.identity));
        },
        saved() {
            var _ = this;

            return _.newsfeed.filter(function(item) {
                return !!item.isSaved;
            }).sort(sorter(_.identity));
        },
        unread() {
            var _ = this;

            return _.newsfeed.filter(function(item) {
                return !item.isRead;
            }).sort(sorter(_.identity));
        },
        feeds() {
            var _ = this;

            if (!_.identity) return [];
            return (_.identity.feeds || []).sort(SORT_BY_NAME);
        }
    },
    methods
};
</script>
