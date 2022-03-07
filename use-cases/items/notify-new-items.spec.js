import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

describe('Items: Notify new items', () => {
  describe('from the background', () => {
    let app
    let item

    beforeEach(async () => {
      app = await mountApp()

      app.vm.state.data.feeds[0].updatedAt = 0

      item = { title: 'Foo Bar' }
      app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('rss', rawRSSResponse(item))

      app.vm.commands.noAutomaticFetches = false
      app.vm.commands.fetchNextFeedPerpetually(app.vm.identity)

      await app.wait()
    })

    it('does not show the item initially', () => {
      expect(app.text()).not.toContain(item.title)
    })

    it('shows the new item notification', () => {
      expect(app.find('[aria-label="Show new items"]').text()).toContain('1 new item')
    })

    it('can show the new items', async () => {
      await app.click('[aria-label="Show new items"]')

      expect(app.text()).toContain(item.title)
    })

    it('newly-fetched old items are not notified', async () => {
      const app = await mountApp()
      app.vm.state.data.feeds[0].updatedAt = 0
      app.vm.commands.noAutomaticFetches = false

      const feed = app.vm.state.findAll('feeds')[0]
      feed.latestInteractionAt = new Date(0)
      const item = { guid: 123, title: 'Foo Bar', pubDate: new Date() }
      app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('rss', rawRSSResponse(item))

      app.vm.commands.fetchNextFeedPerpetually(app.vm.identity)

      await app.wait()

      expect(app.find('[aria-label="Show new items"]').text()).toContain('1 new item')

      const oldItem = { guid: 456, title: 'Baz Bar', pubDate: new Date(0) }
      app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('rss', rawRSSResponse(oldItem))

      feed.updatedAt = 0
      app.vm.commands.fetchNextFeedPerpetually(app.vm.identity)

      await app.wait()

      expect(app.find('[aria-label="Show new items"]').text()).toContain('1 new item')
    })
  })
})
