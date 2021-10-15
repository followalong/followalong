import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Feeds: Catch up', () => {
  describe('from the feed page', () => {
    it('marks all items as read', async () => {
      const app = await mountApp()
      const item = { title: 'Foo Bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

      expect(app.findAll('.read').length).toEqual(0)

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label^="Visit"]')
      await app.click('[aria-label="Toggle Menu"]')
      await app.click('[aria-label^="Catch up on"]')

      expect(app.findAll('.read').length).toEqual(1)
    })

    it('saves the identity in local storage', async () => {
      const app = await mountApp()
      const item = { title: 'Foo Bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

      expect(app.findAll('.read').length).toEqual(0)

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label^="Visit"]')
      await app.click('[aria-label="Toggle Menu"]')
      await app.click('[aria-label^="Catch up on"]')

      await app.vm.commands.localStore.getItem(app.initialIdentityId).then((data) => {
        expect(data.items[0].readAt).toBeGreaterThan(0)
      })
    })
  })
})
