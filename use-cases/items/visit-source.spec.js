import { mountApp, flushPromises, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Items: Visit source', () => {
  describe('from the item page', () => {
    it('can go to the source', async () => {
      const app = await mountApp()
      const item = { link: 'https://example.com/link' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="FollowAlong"]')
      await flushPromises()

      expect(app.find('[aria-label^="Visit source"]').element.getAttribute('href')).toEqual(item.link)
    })
  })
})
