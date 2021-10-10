import { mountApp, flushPromises, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Feeds: Fetch', () => {
  describe('from the feeds page', () => {
    it('fetches new items', async () => {
      const app = await mountApp()
      const item = { title: 'Foo Bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label^="Fetch"]')
      await app.click('[aria-label^="Visit"]')

      expect(app.text()).toContain(item.title)
    })
  })

  describe('from the feed page', () => {
    it('fetches new items', async () => {
      const app = await mountApp()
      const item = { title: 'Foo Bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label^="Visit"]')
      await app.click('[aria-label="Toggle Menu"]')
      await app.click('[aria-label^="Fetch"]')

      expect(app.text()).toContain(item.title)
    })
  })
})
