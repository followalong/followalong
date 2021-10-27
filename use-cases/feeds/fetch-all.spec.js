import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Feeds: Fetch all feeds', () => {
  describe('from the logo', () => {
    it('fetches all feeds', async () => {
      const app = await mountApp()
      const item = { title: 'Foo Bar' }
      const expectedFeedsLength = app.vm.queries.allFeeds().length
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith('rss', rawRSSResponse(item))

      await app.click('[aria-label="FollowAlong"]')
      await app.click('[aria-label="What\'s new?"]')

      expect(app.vm.queries.serviceForIdentity().rss).toHaveBeenCalledTimes(expectedFeedsLength)
      expect(app.text()).toContain(item.title)
    })
  })

  describe('from the feeds page', () => {
    it('fetches all feeds', async () => {
      const app = await mountApp()
      const item = { title: 'Foo Bar' }
      const expectedFeedsLength = app.vm.queries.allFeeds().length
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith('rss', rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="Fetch all feeds"]')
      expect(app.vm.queries.serviceForIdentity).toHaveBeenCalledTimes(expectedFeedsLength)

      await app.click('[aria-label="What\'s new?"]')
      expect(app.text()).toContain(item.title)
    })
  })

  describe('upon initial page load', () => {
    it.todo('fetches feeds in the background')
    it.todo('scatters the fetches')
  })
})
