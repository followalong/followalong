import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

describe('Feeds: Fetch all feeds', () => {
  describe('from the feeds page', () => {
    it('fetches all feeds', async () => {
      const app = await mountApp()
      const item = { title: 'Foo Bar' }
      const expectedFeedsLength = app.vm.queries.allFeeds().length
      app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('rss', rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="Fetch all feeds"]')
      expect(app.vm.queries.addonForIdentity).toHaveBeenCalledTimes(expectedFeedsLength)

      await app.click('[aria-label="What\'s new?"]')
      expect(app.text()).toContain(item.title)
    })
  })

  describe('upon initial page load', () => {
    it.todo('fetches feeds in the background')
    it.todo('scatters the fetches')
  })
})
