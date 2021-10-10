import { mountApp, flushPromises, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Feeds: Fetch all feeds', () => {
  describe('from the logo', () => {
    it('fetches all feeds', async () => {
      const app = await mountApp()
      const item = { title: 'Foo Bar' }
      const expectedFeedsLength = app.vm.state.findAll('feeds').length
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

      await app.click('[aria-label="FollowAlong"]')
      await flushPromises()

      expect(app.vm.queries.serviceForIdentity).toHaveBeenCalledTimes(expectedFeedsLength)
      expect(app.text()).toContain(item.title)
    })
  })

  describe('from the feeds page', () => {
    it('fetches all feeds', async () => {
      const app = await mountApp()
      const item = { title: 'Foo Bar' }
      const expectedFeedsLength = app.vm.state.findAll('feeds').length
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="Fetch all feeds"]')
      expect(app.text()).toContain('Loading...')
      expect(app.vm.queries.serviceForIdentity).toHaveBeenCalledTimes(expectedFeedsLength)

      await flushPromises()
      await app.click('[aria-label="What\'s new?"]')
      expect(app.text()).toContain(item.title)
    })
  })
})
