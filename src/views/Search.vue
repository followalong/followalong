<template>
  <div class="search">
    <h1>
      <span v-if="feed && feed.name">{{feed.name}}</span>
      <span v-else><strong>Search:</strong> {{app.q}}</span>
    </h1>

    <p v-if="error">{{error}}</p>

    <div v-else>
      <p v-if="loading">
        Loading...
      </p>
      <div v-else>
        <div v-if="feed">
          <div v-if="feed.error">
            {{feed.error.message}}
          </div>
          <div v-if="sortedItems && sortedItems.length">
            <button v-on:click="app.subscribe(feed, sortedItems)">Subscribe</button>

            <ul class="items">
              <li
                is="item"
                v-for="item in sortedItems"
                :key="item.guid"
                :app="app"
                :item="item"
                showContent="true"
              ></li>
            </ul>
          </div>
          <p v-else>No items found.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Item  from '@/components/item/component.vue';
import { getContent, parseItems } from '@/components/app/fetcher';
import sorter       from '@/components/app/sorter';
import async from 'no-async';

var HREF_ATTR = /href=["']?([^"']+)["'\s]/,
    XML_URL = /https?\:\/\/[a-zA-Z0-9\.\/]+\.xml([?a-zA-Z0-9_=-]+)?/g,
    LINK_TAG = /<link[^>]+application\/rss[^>]+>/g;

function qFormat(q) {
  if (/\w\.\w/.test(q)) {
    if (q.slice(0, 4) === 'http') {
      return q;
    } else {
      return 'http://' + q;
    }
  }

  return q;
}

function isRSS(data) {
  return data && data.slice(0, 5) === '<?xml';
}

function checkURLAndPossibilitiesForData(app, feed, url, done) {
  var proxy = app.findService(app.identity, 'rss'),
      jsonResponse;

  getContent(proxy, url, function(err, data) {
    if (err || !data) {
      return done(err || 'No page found.');
    }

    try {
      jsonResponse = JSON.parse(data);
    } catch (e) {}

    if (isRSS(data)) {
      feed.url = url;
      parseItems(app, feed, data, [], undefined, function(err, items) {
        done(undefined, { url: url, items: items });
      });
    } else if (jsonResponse) {
      checkURLAndPossibilitiesForData(app, feed, jsonResponse.Redirect, function(err, data) {
        if (data && data.items) {
          return done(undefined, { url: jsonResponse.Redirect, items: data.items });
        }

        done('No page found.');
      });
    } else {
      var xmlFeeds = data.match(XML_URL) || [],
          moreFeeds = (data.match(LINK_TAG) || []).map(function(tag) {
            return tag.match(HREF_ATTR)[1];
          }),
          items;

      async.eachSeries(xmlFeeds.concat(moreFeeds), function(newURL, next) {
        checkURLAndPossibilitiesForData(app, feed, newURL, function(err, data) {
          if (data && data.items) {
            url = newURL;
            items = data.items;
            return next('Found');
          }

          next();
        });
      }, function() {
        if (items) {
          return done(undefined, { url: url, items: items });
        }

        var channelIdMatch = data.match(/data-channel-external-id=\"([^"]+)\"/);

        if (channelIdMatch) {
          return checkURLAndPossibilitiesForData(app, feed, 'https://www.youtube.com/feeds/videos.xml?channel_id=' + channelIdMatch[1], function(err, data) {
            if (data && data.items) {
              return done(undefined, data);
            }

            done('No page found.');
          });
        }

        done('No page found.');
      });
    }
  });
}

var Q_THROTTLE;
function qChangeThrottle() {
  var _ = this;

  clearTimeout(Q_THROTTLE);

  Q_THROTTLE = setTimeout(function() {
    qChange.call(_);
  }, 750);
}

function qChange() {
  var _ = this,
      q = qFormat(_.app.q || ''),
      feed = { url: q };

  if (!_.app.identity) {
    return;
  }

  _.loading = true;
  _.feed = undefined;
  _.error = false;
  _.items = [];

  async.series([
    function ifLooksLikeURL(next) {
      if (!_.app.isURL(q)) {
        return next();
      }

      checkURLAndPossibilitiesForData(_.app, feed, q, function(err, data) {
        if (data && data.items) {
          _.items = data.items;
        }

        next();
      });
    },

    function duckDuckGoYouTube(next) {
      if (_.items.length) {
        return next();
      }

      checkURLAndPossibilitiesForData(_.app, feed, 'https://www.youtube.com/results?search_query=' + window.encodeURIComponent(q), function(err, data) {
        if (data && data.items) {
          _.items = data.items;
          feed.url = data.url;
        }

        next();
      });
    }
  ], function(err) {
    _.loading = false;

    if (!_.items.length || err) {
      _.error = err || 'Could not find a feed. Try searching with a direct URL.';
      return;
    }

    _.feed = feed;
  });
}

export default {
  name: 'search',
  props: ['app'],
  components: {
    Item
  },
  data: function() {
    return {
        error: false,
        loading: false,
        items: [],
        feed: undefined
    };
  },
  created() {
    var _ = this;

    setTimeout(function() {
      qChange.call(_);
    }, 100);
  },
  watch: {
    'app.q': qChangeThrottle,
    'app.identity': qChange
  },
  computed: {
    sortedItems() {
      return this.items.sort(sorter(this.app.identity, '_updatedAt', this.feed));
    }
  }
};
</script>
