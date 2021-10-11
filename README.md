# FollowAlong

## Why Am I still using YouTube / FB / News Sites?

- Play songs (looking for specific content)
- Discover (looking for new content)
- Interact in a group (comment / like / share)

## TODO

- Specs
- Dark mode
- Change encryption
- Save to local
- Specs should save to local
- Scatter fetch all
- 3 Core Services
- Specs should save to remote
- Remove unused stuff
- Limit read items
- Documentation
  - Spinning up your own frontend
  - Spinning up your own backend
- Interactions
- Memberships

## Addons

- RSS Proxy: A way to bypass CORS restrictions
- Search: A way to find things
- Sync: A way to backup account data and sync to other devices
- Discovery: A way to discover new things
- Media: A way to backup saved media files that may disappear over time
- Publishing: A way to publish content

## Ads

The power of curation must be in the hands of the Feed. If things go bad, they can just change providers. They can also just supply their own.

An "Ad Provider" is in charge of showing ads.

An "Ad Provider" could be the feed itself OR outsourced – its just a link.

The publisher can define at the `Item` level:

```xml
<Item>
  <Ad format="skyscraper" src="https://example.com/my-feed/ad.jpg" href="httsp://example.com">
</Item>
```

Another, more complicated option would be to add it at the `Feed` level:

```xml
<Feed>
  <AdProvider url="https://example.com/my-feed">
</Feed>
```
