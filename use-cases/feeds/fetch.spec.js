import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Feeds: Fetch', () => {
  describe('from the feeds page', () => {
    let app
    let item

    beforeEach(async () => {
      app = await mountApp()
      item = { title: 'Foo Bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith('rss', rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label^="Fetch"]')
      await app.click('[aria-label^="Visit"]')
    })

    it('fetches new items', async () => {
      expect(app.text()).toContain(item.title)
    })

    it('saves to local storage', async () => {
      const localData = await app.getLocalDefaultIdentity()

      expect(localData.items.length).toBeGreaterThan(0)
    })
  })

  describe('from the feed page', () => {
    let app
    let item

    beforeEach(async () => {
      app = await mountApp()
      item = { title: 'Foo Bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith('rss', rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label^="Visit"]')
      await app.click('[aria-label="Toggle Menu"]')
      await app.click('[aria-label^="Fetch"]')
    })

    it('fetches new items', async () => {
      expect(app.text()).toContain(item.title)
    })

    it('saves to local storage', async () => {
      const localData = await app.getLocalDefaultIdentity()

      expect(localData.items.length).toBeGreaterThan(0)
    })
  })
})
