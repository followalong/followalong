import Vue          from 'vue';
import sorter       from '@/components/app/sorter';
import fetcher      from '@/components/app/fetcher';
import aes256       from 'aes256';
import uniqId       from 'uniq-id';
import copy         from 'copy-to-clipboard';
import async        from 'no-async';
import loadExternal from 'load-external';
import { saveAs }   from 'file-saver';
import truncate     from 'trunc-html';

var HALF_HOUR = 1000 * 60 * 60 * 0.5,
    TWO_MINUTES = 1000 * 60 * 1,
    ALLOWED_TAGS = [
        'a', 'article', 'b', 'blockquote', 'br', 'caption', 'code', 'del', 'details', 'div', 'em',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'main', 'ol',
        'p', 'pre', 'section', 'span', 'strike', 'strong', 'sub', 'summary', 'sup', 'table',
        'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul'
    ],
    SCRIPT_CACHE = {},
    nextFeedFetcher;

function LAST_UPDATED(a, b) {
    if (a._updatedAt < b._updatedAt) return -1;
    if (a._updatedAt > b._updatedAt) return 1;
    return 0;
}

function UNPAUSED(feed) {
    return !feed.paused;
}

function ITEM_MAP(item) {
    return {
        author: item.author,
        feedId: item.feedId,
        guid: item.guid,
        image: item.image,
        isRead: item.isRead,
        isSaved: item.isSaved,
        link: item.link,
        pubDate: item.pubDate,
        title: item.title,
        content: item.content,
        _updatedAt: item._updatedAt
    };
}

function videoSrc(item) {
    if (item && item.guid && item.guid.slice(0, 9) === 'yt:video:') {
        return 'https://www.youtube.com/embed/' + item.guid.slice(9);
    }

    return undefined;
}

function audioSrc(item) {
    if (item && /\.(mp3|wav)$/.test(item.link)) {
        return item.link;
    }

    return undefined;
}

function timeAgo(date) {
    if (typeof date !== 'object') {
        date = new Date(date);
    }

    var seconds = Math.floor((new Date() - date) / 1000),
        interval = Math.floor(seconds / 31536000),
        intervalType;

    if (interval >= 1) {
        intervalType = 'year';
    } else {
        interval = Math.floor(seconds / 2592000);

        if (interval >= 1) {
            intervalType = 'month';
        } else {
            interval = Math.floor(seconds / 86400);

            if (interval >= 1) {
                intervalType = 'day';
            } else {
                interval = Math.floor(seconds / 3600);

                if (interval >= 1) {
                    intervalType = 'hour';
                } else {
                    interval = Math.floor(seconds / 60);

                    if (interval >= 1) {
                        intervalType = 'minute';
                    } else {
                        interval = seconds;
                        intervalType = 'second';
                    }
                }
            }
        }
    }

    if (interval > 1 || interval === 0) {
        intervalType += 's';
    }

    return interval + ' ' + intervalType + ' ago';
}

export default {
    // log() {
    //   console.log(...arguments);
    // },
    fetchAllFeeds(identity, override, done) {
        var _ = this,
            updatedAt = Date.now();

        if (_.app.loading) return;

        _.app.loading = true;

        async.eachParallel(identity.feeds.filter(UNPAUSED), function(feed, next) {
            _.fetchFeed(identity, feed, updatedAt, override, next);
        }, function() {
            _.app.loading = false;
            _.app.save();

            if (typeof done === 'function') {
                done();
            }
        });
    },

    feedFetcherDuration(identity) {
        return HALF_HOUR / identity.feeds.length;
    },

    fetchNextFeed(identity) {
        var _ = this,
                updatedAt = Date.now();

        var feed = identity.feeds.filter(UNPAUSED).sort(LAST_UPDATED)[0];

        if (_.app.loading || !feed) {
            setTimeout(function() {
                _.fetchNextFeed(identity);
            }, _.feedFetcherDuration(identity));

            return;
        }

        _.fetchFeed(identity, feed, updatedAt, true, function() {
            _.app.save();

            setTimeout(function() {
                _.fetchNextFeed(identity);
            }, _.feedFetcherDuration(identity));
        });
    },

    fetchFeed(identity, feed, updatedAt, override, done) {
        var _ = this;

        updatedAt = updatedAt || Date.now();

        if (!override && feed._updatedAt && feed._updatedAt > updatedAt - HALF_HOUR) {
            return done();
        }

        feed.loading = true;

        fetcher(_.app.getProxy(), identity.items, feed, updatedAt, function() {
            feed.loading = false;

            if (typeof done === 'function') {
                done();
            }
        });
    },

    catchMeUp() {
        var _ = this;

        _.identity.items.forEach(function(item) {
            item.isRead = true;
        });

        _.app.save();
    },

    save(done) {
        var _ = this;

        _.app.trimItems(_.app.identity);
        _.app.beforeSave(function() {
            _.app.store.setItem(
                _.app.identity.id,
                _.app.encrypt(
                    _.app.identity,
                    _.app.toLocal(_.app.identity)
                )
            );

            _.afterSave(done);
        });
    },

    beforeSave(done) {
        var _ = this,
                remote = (window.remotes || []).find(function(r) {
                    return r.strategy === _.app.identity.remote.strategy;
                });

        if (!remote || typeof remote.get !== 'function') {
            if (typeof done === 'function') {
                done();
            }

            return;
        }

        remote.get(_.app, _.app.identity, _.app.identity.remote, done);
    },

    afterSave(done) {
        var _ = this,
            remote = (window.remotes || []).find(function(r) {
                return r.strategy === _.app.identity.remote.strategy;
            });

        if (!remote || typeof remote.update !== 'function') {
            if (typeof done === 'function') {
                done();
            }

            return;
        }

        remote.update(_.app, _.app.identity, _.app.identity.remote, done);
    },

    saveForLater(item) {
        var _ = this;

        item._updatedAt = Date.now();
        item.isSaved = !item.isSaved;

        _.app.save();
    },

    setProxyDefaults(proxy) {
        if (!proxy) return;

        var _ = this,
            found = _.app.proxies.find(function(p) {
                return p.strategy === proxy.strategy;
            }),
            field, key;

        if (found && found.fields) {
            for (key in found.fields) {
                field = found.fields[key];
                proxy[key] = proxy[key] || field.default;
            }
        }
    },

    setIdentityDefaults(identity) {
        var _ = this;

        identity.id = identity.id || _.app.generateId();
        identity.name = identity.name || '...';
        identity.maxReadCount = typeof identity.maxReadCount === 'undefined' ? 100 : parseInt(identity.maxReadCount);
        identity.feeds = identity.feeds || [];
        identity.items = identity.items || [];

        identity.local = identity.local || {
            strategy: 'none'
        };

        identity.remote = identity.remote || {
            strategy: 'none'
        };

        identity.proxy = identity.proxy || {
            strategy: 'followalong'
        };

        _.app.setProxyDefaults(identity.proxy);

        if (typeof identity._decrypted === 'undefined') {
            identity._decrypted = false;
        }
    },

    trimItems(identity) {
        var _ = this,
            limit = parseInt(identity.maxReadCount),
            items = _.app.newsfeed.filter(function(item) {
                return item.isRead && !item.isSaved;
            }).sort(sorter(identity, '_updatedAt')),
            itemsLength = items.length,
            item, i;

        for (i = itemsLength - 1; i >= 0; i--) {
            if (itemsLength <= limit) {
                break;
            }

            item = items[i];

            if (!item) continue;

            identity.items.splice(identity.items.indexOf(item), 1);
            itemsLength--;
        }
    },

    dateFormat(date) {
        return timeAgo(new Date(date));
    },

    popout(item) {
        var _ = this;

        if (_.app.playing === item) {
            _.app.playing = undefined;
        } else {
            _.app.playing = item;
        }
    },

    videoSrc,

    audioSrc,

    hasMedia(item) {
        return videoSrc(item) || audioSrc(item);
    },

    isURL(q) {
        return /^http/.test(q);
    },

    getProxy() {
        if (!this.app.identity || !this.app.identity.proxy) {
            return false;
        }

        var _ = this,
            proxy = _.app.proxies.find(function(p) {
                return p.strategy === _.app.identity.proxy.strategy;
            }),
            key;

        for (key in proxy.fields) {
            proxy[key] = _.app.identity.proxy[key];
        }

        proxy.app = _;

        return proxy;
    },

    fetchURL(url, items, _) {
        _ = _ || this;

        var feed = Vue.observable({ url: url });

         _.app.loading = true;

        fetcher(_.app.getProxy(), items, feed, Date.now(), function() {
            _.feed = feed;

            items.forEach(function(item) {
                item.feed = _.feed;
            });

            _.app.loading = false;
        });
    },

    subscribe(feed, items) {
        var _ = this;

        feed.identityId = _.app.identity.id;
        feed.paused = false;
        feed.loading = false;

        _.app.identity.feeds.push(feed);
        _.app.identity.items.push.apply(_.app.identity.items, items);

        _.app.save();

        _.app.q = '';
        _.$router.push({ name: 'feed', params: { feed_url: feed.url } });
    },

    search(e) {
        var _ = this;

        _.$router.push({ path: '/search', query: { q: _.app.q } });
        e.preventDefault();
    },

    toLocal(identity) {
        return {
            id: identity.id,
            name: identity.name,
            proxy: identity.proxy,
            local: identity.local,
            remote: identity.remote,
            maxReadCount: identity.maxReadCount,
            feeds: identity.feeds.map(function(feed) {
                return {
                    id: feed.id,
                    url: feed.url,
                    name: feed.name,
                    _updatedAt: feed._updatedAt,
                    paused: feed.paused,
                    loading: false
                };
            }),
            items: identity.items.map(ITEM_MAP)
        };
    },

    toRemote(identity) {
        return {
            id: identity.id,
            name: identity.name,
            proxy: identity.proxy,
            local: identity.local,
            remote: identity.remote,
            maxReadCount: identity.maxReadCount,
            feeds: identity.feeds.map(function(feed) {
                return {
                    id: feed.id,
                    url: feed.url,
                    name: feed.name,
                    paused: feed.paused,
                    loading: false
                };
            }),
            items: identity.items.filter(function(item) {
                return item.isSaved;
            }).map(ITEM_MAP)
        };
    },

    download(identity) {
        var _ = this,
            filename = window.location.host.replace(':', '.') + '.' + identity.id + '.json',
            str = JSON.stringify(_.toRemote(identity)),
            blob = new Blob([str], { type: 'application/json;charset=utf-8' });

        saveAs(blob, filename);
    },

    read(item, val) {
        var _ = this,
                current = item.isRead;

        if (typeof val === 'undefined') {
            val = !item.isRead;
        } else if (val === current) {
            return;
        }

        item._updatedAt = Date.now();
        item.isRead = val;

        _.app.save();
    },

    filterBy(arr, attr, value) {
        return arr.filter(function(feed) {
            return feed[attr] === value;
        });
    },

    reset(identity) {
        if (confirm('Are you sure you want to forget this identity?')) {
            var _ = this;

            _.app.store.removeItem(identity.id, function() {
                _.app.store.removeItem('key-' + identity.id, function() {
                    window.location.href = '/';
                });
            });
        }
    },

    encrypt(identity, json) {
        var _ = this,
            key = _.app.keychain[identity.id],
            encrypted = json;

        if (identity.local.strategy === 'none') {
            return encrypted;
        } else if (identity.local.strategy === 'rotate') {
            key = _.app.generateId();
            _.app.saveKey(identity, key, true);
        } else if (identity.local.strategy === 'ask') {
            key = _.app.getAskSecretKey(identity, false);
        } else if (identity.local.strategy === 'store') {
            if (typeof _.app.keychain[identity.id] === 'undefined') {
                key = _.app.generateId();
                _.app.saveKey(identity, key, true);
            }
        }

        if (!key || !key.length) {
            return encrypted;
        }

        encrypted = typeof json === 'string' ? json : JSON.stringify(json);
        encrypted = aes256.encrypt(key, encrypted);

        return encrypted;
    },

    decrypt(identity, str) {
        var _ = this,
            key = _.app.keychain[identity.id];

        if (str && typeof str !== 'string') {
            return str;
        } else if (typeof key === 'undefined') {
            try {
                str = JSON.parse(str);
            } catch (e) {
                try {
                    key = _.app.getAskSecretKey(identity);

                    if (key !== null) {
                            str = JSON.parse(aes256.decrypt(key, str));

                            if (typeof str === 'object' && str.local.strategy === 'store') {
                                _.app.saveKey(identity, key, true);
                                _.app.keychain[identity.id] = key;
                            }
                    }
                } catch (e) {
                    return false;
                }
            }
        } else {
            try {
                str = JSON.parse(aes256.decrypt(key, str));
            } catch (e) { 1; }
        }

        if (typeof str === 'object') {
            return str;
        } else {
            return false;
        }
    },

    getAskSecretKey(identity, reset) {
        var _ = this;

        if (reset) {
            delete _.app.keychain[identity.id];
        }

        if (!_.app.keychain[identity.id]) {
            _.app.keychain[identity.id] = prompt('What is your secret key?');

            if (_.app.keychain[identity.id] === null && reset) {
                identity.local.strategy = 'rotate';
                var key = _.app.generateId();
                _.app.saveKey(identity, key, true);
                return key;
            }
        }

        if (reset) {
            _.app.save();
        }

        return _.app.keychain[identity.id];
    },

    saveKey(identity, key, ignoreSave) {
        var _ = this;

        if (identity.local.strategy === 'ask') {
            delete _.app.keychain[identity.id];
            key = undefined;
        }

        if (identity.local.strategy === 'store' && !key) {
            key = _.app.generateId();
            _.app.keychain[identity.id] = key;
        }

        if (key) {
            _.store.setItem('key-' + identity.id, key);
        } else {
            _.store.removeItem('key-' + identity.id);
        }

        if (!ignoreSave) {
            _.app.save();
        }
    },

    generateId() {
        return uniqId.generateUUID('xxxxyxxxxyxxxxyxxxxyxxxxyxxxxyxxxxyxxxxy', 32)();
    },

    copyConfig(identity) {
        var _ = this;
        copy(JSON.stringify(_.toRemote(identity)));
    },

    decryptIdentity(identity, done) {
        var _ = this;

        if (identity._decrypted) {
            return done();
        }

        _.store.getItem(identity.id, function(err, state) {
            if (!state) {
                return done();
            }

            state = _.decrypt(identity, state);

            if (identity.local.strategy === 'ask') {
                delete _.app.keychain[identity.id];
                state = _.decrypt(identity, state);
            }

            if (!state) {
                if (confirm('Unauthorized. Would you like to refresh this page?')) {
                    window.location.reload();
                } else {
                    document.body.innerHTML = '';
                }

                return;
            }

            _.app.copyAttrs(state, identity, ['name', 'proxy', 'maxReadCount', 'local', 'remote', 'items', 'feeds']);

            identity._decrypted = true;

            done();
        });
    },

    copyAttrs(from, to, attrs) {
        for (var i = attrs.length - 1; i >= 0; i--) {
            to[attrs[i]] = from[attrs[i]];
        }
    },

    constructIdentities(done) {
        var _ = this,
                identities = [],
                keychain = {};

        _.store.keys(function(err, keys) {
            async.eachParallel(keys || [], function(id, next) {
                if (id.slice(0, 4) !== 'key-') {
                    identities.push({ id: id });
                    next();
                } else {
                    _.store.getItem(id, function(err, value) {
                        keychain[id.slice(4)] = value;
                        next();
                    });
                }
            }, function() {
                done(identities, keychain);
            });
        });
    },

    cachedLoadExternal(url, done) {
        var _ = this;

        if (SCRIPT_CACHE[url] === true) {
            done();
        } else if (SCRIPT_CACHE[url] instanceof Array) {
            SCRIPT_CACHE[url].push(done);
        } else {
            SCRIPT_CACHE[url] = [done];

            loadExternal(url, function() {
                for (var i = SCRIPT_CACHE[url].length - 1; i >= 0; i--) {
                    SCRIPT_CACHE[url][i].call(_);
                }

                SCRIPT_CACHE[url] = true;
            });
        }
    },

    setIdentity(identity) {
        var _ = this;

        _.app.setIdentityDefaults(identity);
        _.app.identity = identity;
        _.app.loading = true;

        _.decryptIdentity(identity, function() {
            _.app.setIdentityDefaults(identity);
            _.app.save();

            clearTimeout(nextFeedFetcher);

            _.app.loading = false;

            _.fetchAllFeeds(identity, false, function() {
                nextFeedFetcher = setTimeout(function() {
                    _.fetchNextFeed(_.app.identity);
                }, TWO_MINUTES);
            });
        });
    },

    prepDescription(item, characterLimit, ellipsis) {
        if (!item || !item.content) {
            return '';
        }

        return truncate(
            item.content,
            characterLimit,
            {
                sanitizer: {
                    allowedTags: ALLOWED_TAGS
                }
            }
        ).html;
    },

    profileSize(identity, type) {
        if (!identity || !identity.items) return 'N/A';

        var _ = this,
            unit = 'b',
            size = JSON.stringify(_.app['to' + type](identity)).length;

        if (size > 1000000) {
            size = size / 1000000;
            unit = 'mb';
        } else if (size > 1000) {
            size = size / 1000;
            unit = 'kb';
        }

        return '~' + (Math.round(size * 10) / 10) + ' ' + unit;
    }
};
