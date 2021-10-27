import { mountApp, buildServiceToRespondWith } from '../helper.js'

describe('Feeds: Search', () => {
  describe('if multiple results', () => {
    it('shows a listing of feeds', async () => {
      const app = await mountApp()
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith('search', [{ name: 'Feed #1' }, { name: 'Feed #2' }])

      await app.submit('[aria-label="Search form"]')

      expect(app.text()).toContain('Feed #1')
      expect(app.text()).toContain('Feed #2')
    })

    it('can subscribe to a feed', async () => {
      const expectedFeed = { name: 'Feed #1' }
      const app = await mountApp()
      const initialFeedsLength = app.vm.queries.allFeeds().length
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith('search', [expectedFeed, { name: 'Feed #2' }])

      await app.submit('[aria-label="Search form"]')
      await app.click(`[aria-label="Subscribe to ${expectedFeed.name}"]`)
      await app.click('[aria-label="Feeds"]')

      expect(app.text()).toContain(expectedFeed.name)

      const localData = await app.getLocalDefaultIdentity()
      expect(localData.feeds.length).toEqual(initialFeedsLength + 1)
    })
  })

  describe('if only 1 result', () => {
    it('redirects to the feed page', async () => {
      const expectedFeed = { name: 'Feed #1', url: 'https://example.com/feed' }
      const app = await mountApp()
      app.vm.commands.fetchFeed = jest.fn()
      app.vm.queries.findFeedByUrl = jest.fn(() => expectedFeed)
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith('search', [expectedFeed])

      await app.submit('[aria-label="Search form"]')

      expect(app.text()).toContain(`You're all caught up on ${expectedFeed.name}!`)
    })

    it('can subscribe to a feed', async () => {
      const expectedFeed = { name: 'Feed #1', url: 'https://example.com/feed' }
      const app = await mountApp()
      const initialFeedsLength = app.vm.queries.allFeeds().length
      app.vm.commands.fetchFeed = jest.fn()
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith('search', [expectedFeed])

      await app.submit('[aria-label="Search form"]')
      await app.click('[aria-label="Toggle Menu"]')
      await app.click(`[aria-label="Subscribe to ${expectedFeed.name}"]`)
      await app.click('[aria-label="Feeds"]')

      expect(app.text()).toContain(expectedFeed.url)

      const localData = await app.getLocalDefaultIdentity()
      expect(localData.feeds.length).toEqual(initialFeedsLength + 1)
    })
  })
})
