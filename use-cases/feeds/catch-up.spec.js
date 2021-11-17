import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

describe('Feeds: Catch up', () => {
  describe('from the feed page', () => {
    let app

    beforeEach(async () => {
      app = await mountApp({ overrideCommands: {} })
      const item = { title: 'Foo Bar' }
      app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('rss', rawRSSResponse(item))

      expect(app.findAll('.read').length).toEqual(0)

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label^="Visit"]')
      await app.click('[aria-label="Toggle Menu"]')
      await app.click('[aria-label^="Catch up on"]')
    })

    it('marks all items as read', async () => {
      expect(app.findAll('.read').length).toEqual(1)
    })

    it('saves the identity in local storage', async () => {
      const localData = await app.getLocalDefaultIdentity()

      expect(localData.items[0].readAt).toBeGreaterThan(0)
    })
  })
})
