import Parser     from 'rss-parser';

var parser = new Parser({
    customFields: {
        item: ['media:group', 'content:encoded']
    }
});

function getFeed(proxy, items, feed, updatedAt, callback, forEachCallback) {
    if (!proxy) {
        return callback();
    }

    var lastUpdate = feed._updatedAt || new Date(0);

    if (updatedAt) {
        feed._updatedAt = updatedAt;
    }

    feed.id = feed.id || proxy.app.generateId();

    proxy.fetchURL(proxy.app, proxy.app.identity, {
        url: feed.url
    }, function(err, data) {
        if (!data) {
            feed.error = 'Could not fetch feed. If you\'re not already, Try using a CORS proxy (in Setup).';
            console.error(err);
            callback(err);
            return;
        } else {
            delete feed.error;
        }

        parser.parseString(data, function(err, data) {
            if (err) {
                feed.error = 'Could not parse feed. Feed does not seem to be formatted correctly.';
                console.error(data);
                callback(err);
                return;
            } else {
                delete feed.error;
            }

            feed.lastFetchCount = data.items.length;
            feed.name = feed.name || data.name || data.title;
            feed.description = feed.description || data.description;

            data.items.forEach(function(newItem) {
                if (new Date(newItem.pubDate) < lastUpdate) {
                    return;
                }

                newItem.guid = newItem.guid || newItem.id || proxy.app.generateId();

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
                    newItem.guid = newItem.guid || proxy.app.generateId();
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

            callback(undefined, data.items);
        });
    });
}

export default getFeed;
