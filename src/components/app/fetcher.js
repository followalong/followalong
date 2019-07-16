import Parser     from 'rss-parser';

var parser = new Parser({
    customFields: {
        item: ['media:group', 'content:encoded']
    }
});

function getContent(proxy, url, done) {
    if (!proxy) {
        return done();
    }

    proxy.fetch(proxy.app, proxy.app.identity, {
        url: url
    }, function(err, data) {
        if (!data) {
            done(err || 'Could not fetch feed. If you\'re not already, Try using a CORS proxy (in Setup).');
            return;
        }

        done(undefined, data);
    });
}

function parseItems(app, feed, data, items, updatedAt, done) {
    var lastUpdate = feed._updatedAt || new Date(0);

    feed.id = feed.id || app.generateId();

    parser.parseString(data, function(err, data) {
        if (err) {
            feed.error = 'Could not parse feed. Feed does not seem to be formatted correctly.';
            console.error(data);
            done(err);
            return;
        } else {
            delete feed.error;
        }

        feed.lastFetchCount = data.items.length;
        feed.name = feed.name || data.name || data.title;
        feed.description = feed.description || data.description;

        if (updatedAt) {
            feed._updatedAt = updatedAt;
        }

        data.items.forEach(function(newItem) {
            if (new Date(newItem.pubDate) < lastUpdate) {
                return;
            }

            newItem.guid = newItem.guid || newItem.id || app.generateId();

            try {
                newItem.image = newItem['media:group']['media:thumbnail'][0].$;
                delete newItem['media:group'];
            } catch (e) { 1; }

            var oldItem = items.find(function(oldItem) {
                return oldItem.guid === newItem.guid;
            });

            if (oldItem) {
                for (var key in newItem) {
                    oldItem[key] = newItem[key];
                }

                newItem = oldItem;
            } else {
                newItem.guid = newItem.guid || app.generateId();
                newItem.isRead = false;
                newItem.isSaved = false;
                items.push(newItem);
            }

            newItem.pubDate = newItem.pubDate || newItem.pubdate || newItem.date;
            newItem.content = newItem['content:encoded'] || newItem.content || newItem.summary || newItem.description;

            if (newItem.content) {
                newItem.content = newItem.content.replace('<![CDATA[', '').replace(']]>', '');
            }

            newItem.feedId = feed.id;
            newItem._updatedAt = updatedAt;
        });

        done(undefined, data.items);
    });
}

function getFeed(proxy, items, feed, updatedAt, callback, forEachCallback) {
    if (!proxy) {
        return callback();
    }

    getContent(proxy, feed.url, function(err, data) {
        if (err) {
            feed.error = err;
            console.error(err);
            callback(err);
            return;
        } else {
            delete feed.error;
        }

        parseItems(proxy.app, feed, data, items, updatedAt, callback);
    });
}

export {
    getContent,
    parseItems,
    getFeed
};
