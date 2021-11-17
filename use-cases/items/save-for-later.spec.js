import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

describe('Items: Save for later', () => {
  describe('from the home page', () => {
    let app
    let item

    beforeEach(async () => {
      app = await mountApp()
      item = { title: 'Foo bar' }
      app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('rss', rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="FollowAlong"]')
      expect(app.findAll(`[aria-label="Unsave ${item.title}"]`).length).not.toEqual(1)

      await app.click(`[aria-label="Save ${item.title}"]`)
      expect(app.findAll(`[aria-label="Unsave ${item.title}"]`).length).toEqual(1)
    })

    it('can be toggled', async () => {
      expect(app.findAll(`[aria-label="Save ${item.title}"]`).length).not.toEqual(1)
    })

    it('saves to local storage', async () => {
      const localData = await app.getLocalDefaultIdentity()
      expect(localData.items[0].savedAt).toBeGreaterThan(0)
    })
  })

  describe('from the item page', () => {
    let app
    let item

    beforeEach(async () => {
      app = await mountApp()
      item = { title: 'Foo bar' }
      app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('rss', rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="FollowAlong"]')
      await app.click('[aria-label^="Visit"]')
      await app.click('[aria-label="Toggle Menu"]')
      expect(app.findAll(`[aria-label="Unsave ${item.title}"]`).length).not.toBeGreaterThan(1)

      await app.click(`[aria-label="Save ${item.title}"]`)
    })

    it('can be toggled', async () => {
      await app.click('[aria-label="Toggle Menu"]')
      expect(app.findAll(`[aria-label="Unsave ${item.title}"]`).length).toEqual(1)
    })

    it('saves to local storage', async () => {
      const localData = await app.getLocalDefaultIdentity()
      expect(localData.items[localData.items.length - 1].savedAt).toBeGreaterThan(0)
    })
  })
})
