import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Feeds: Fetch', () => {
  describe('from the feeds page', () => {
    let app
    let item

    beforeEach(async () => {
      app = await mountApp()
      item = { title: 'Foo Bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label^="Fetch"]')
      await app.click('[aria-label^="Visit"]')
    })

    it('fetches new items', async () => {
      expect(app.text()).toContain(item.title)
    })

    it('saves to local storage', async () => {
      await app.vm.commands.localStore.getItem(app.initialIdentityId).then((data) => {
        expect(data.items.length).toBeGreaterThan(0)
      })
    })
  })

  describe('from the feed page', () => {
    let app
    let item

    beforeEach(async () => {
      app = await mountApp()
      item = { title: 'Foo Bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label^="Visit"]')
      await app.click('[aria-label="Toggle Menu"]')
      await app.click('[aria-label^="Fetch"]')
    })

    it('fetches new items', async () => {
      expect(app.text()).toContain(item.title)
    })

    it('saves to local storage', async () => {
      await app.vm.commands.localStore.getItem(app.initialIdentityId).then((data) => {
        expect(data.items.length).toBeGreaterThan(0)
      })
    })
  })
})
