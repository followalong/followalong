<template>
    <div id="app">
        <MediaPlayer :app="app" :playing="playing" v-if="playing" />

        <div class="header">
            <div class="nav table">
                <ul class="table-row">
                    <li class="table-cell logo">
                        <a href="javascript:;" v-on:click="$router.push('/'); app.toggleSidebar(true); fetchAllFeeds(identity, true)">
                            <font-awesome-icon icon="spinner" spin v-if="loading" />
                            <img :src="logo" v-if="!loading">
                            <img :src="mobileLogo" v-if="!loading">
                        </a>
                    </li>
                    <li class="table-cell search">
                        <form method="GET" action="/search" v-on:submit="search">
                            <input type="text" name="q" v-model="q" autocomplete="off" placeholder="Search...">
                        </form>
                    </li>
                    <li v-if="identity" class="table-cell identities">
                        <a class="desktop-only">
                            <strong>{{ identity.name }}</strong>
                        </a>

                        <a href="javascript:;" class="mobile-only" v-on:click="app.toggleSidebar()">
                            <font-awesome-icon icon="bars" />
                        </a>

                        <ul>
                            <li v-if="!nonIdentities.length">
                                <router-link to="/settings">
                                    Settings
                                </router-link>
                            </li>
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
import localForage   from 'localforage';
import Sidebar       from '@/components/sidebar/component.vue';
import MediaPlayer   from '@/components/media-player/component.vue';
import seed          from '@/components/app/seed';
import sorter        from '@/components/app/sorter';
import methods       from '@/components/app/methods';
import changelog     from '@/../changelog.json';

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
            mobileLogo: window.mobileLogo || '/img/favicon.svg',
            q: _.$route.query.q || '',
            api: false,
            store: localForage.createInstance({
                name: 'commmunity'
            }),
            loading: true,
            identities: [],
            keychain: {},
            identity: {},
            sidebarClass: '',
            hints: [],
            now: new Date(),
            proxies: window.proxies.filter(function(server) {
                return typeof server.fetchURL === 'function';
            }),
            remotes: window.proxies.filter(function(server) {
                return typeof server.getIdentity === 'function' && typeof server.setIdentity === 'function';
            }),
            publishers: window.proxies.filter(function(server) {
                return typeof server.publishItem === 'function';
            }),
            playing: undefined,
            changelog: changelog,
            version: Object.keys(changelog)[0]
        };
    },
    mounted() {
        var _ = this;

        setInterval(function() {
            _.now = new Date();
        }, 60000);

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

            return (_.identity.items || []).filter(function(item) {
                _.setMediaVerb(item);
                return true;
            }).sort(sorter(_.identity));
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
        unreadWatches() {
            var _ = this;

            return _.unread.filter(function(item) {
                return item._mediaVerb === 'watch';
            });
        },
        unreadListens() {
            var _ = this;

            return _.unread.filter(function(item) {
                return item._mediaVerb === 'listen';
            });
        },
        unreadReads() {
            var _ = this;

            return _.unread.filter(function(item) {
                return item._mediaVerb === 'read';
            });
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
