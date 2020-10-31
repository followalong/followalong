export default function (identity, remoteData) {
  if (!remoteData) {
    return
  }

  var localFeeds = identity.feeds || []
  var localItems = identity.items || []
  var remoteFeeds = remoteData.feeds || []
  var remoteItems = remoteData.items || []
  var localFeed; var remoteFeed
  var localItem; var remoteItem
  var i

  for (i = remoteFeeds.length - 1; i >= 0; i--) {
    remoteFeed = remoteFeeds[i]
    localFeed = localFeeds.find(function (f) {
      return f.url === remoteFeed.url
    })

    if (localFeed) {
      if (remoteFeed._updatedAt > localFeed._updatedAt) {
        localFeed.url = remoteFeed.url
        localFeed.name = remoteFeed.name
        localFeed._remoteUpdatedAt = remoteFeed._updatedAt
        localFeed.paused = remoteFeed.paused
      }
    } else {
      localFeeds.push(remoteFeed)
    }
  }

  for (i = remoteItems.length - 1; i >= 0; i--) {
    remoteItem = remoteItems[i]
    localItem = localItems.find(function (f) {
      return f.guid === remoteItem.guid
    })

    if (localItem) {
      if (remoteItem._updatedAt > localItem._updatedAt) {
        for (var key in remoteItem) {
          localItem[key] = remoteItem[key]
        }
      }
    } else {
      localItems.push(remoteItem)
    }
  }

  for (i = localFeeds.length - 1; i >= 0; i--) {
    localFeed = localFeeds[i]
    remoteFeed = remoteFeeds.find(function (f) {
      return f.url === remoteFeed.url
    })

    if (!remoteFeed) {
      localFeeds.splice(i, 1)
    }
  }

  for (i = localItems.length - 1; i >= 0; i--) {
    localItem = localItem[i]
    remoteItem = remoteItems.find(function (f) {
      return f.url === remoteItem.url
    })

    if (!remoteItem) {
      localItem.splice(i, 1)
    }
  }
}
