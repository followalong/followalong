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
      expect(app.vm.queries.addonForIdentity).toHaveBeenCalled()

      await app.click('[aria-label="What\'s new?"]')
      expect(app.text()).toContain(item.title)
    })

    it('does not trigger the new items notification', async () => {
      const app = await mountApp()
      const item = { title: 'Foo Bar' }
      const expectedFeedsLength = app.vm.queries.allFeeds().length
      app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('rss', rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="Fetch all feeds"]')
      await app.text('[aria-label="What\'s new?"]')

      expect(app.findAll('[aria-label="Show new items"]').length).toEqual(0)
    })
  })

  describe('upon initial page load', () => {
    it.todo('fetches feeds in the background')
  })
})
