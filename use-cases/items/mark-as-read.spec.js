import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

describe('Items: Mark as read', () => {
  describe('from the home page', () => {
    let app
    let item

    beforeEach(async () => {
      app = await mountApp()
      item = { title: 'Foo bar' }
      app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('rss', rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="Fetch all feeds"]')
      await app.click('[aria-label="FollowAlong"]')
      expect(app.findAll(`[aria-label="Unread ${item.title}"]`).length).not.toEqual(1)

      await app.click(`[aria-label="Read ${item.title}"]`)
    })

    it('can be toggled', async () => {
      expect(app.findAll(`[aria-label="Unread ${item.title}"]`).length).toEqual(1)

      await app.click(`[aria-label="Unread ${item.title}"]`)
      expect(app.findAll(`[aria-label="Read ${item.title}"]`).length).not.toEqual(1)
    })

    it('saves to local storage', async () => {
      const localData = await app.getLocalDefaultIdentity()

      expect(localData.items[localData.items.length - 1].readAt).toBeGreaterThan(0)
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
      await app.click('[aria-label="Fetch all feeds"]')
      await app.click('[aria-label="FollowAlong"]')
      await app.click('[aria-label^="Visit"]')
      expect(app.findAll(`[aria-label="Unread ${item.title}"]`).length).not.toEqual(1)

      await app.click('[aria-label="Toggle Menu"]')
      await app.click(`[aria-label="Unread ${item.title}"]`)
      await app.click('[aria-label="Toggle Menu"]')
      expect(app.findAll(`[aria-label="Read ${item.title}"]`).length).toEqual(1)

      await app.click(`[aria-label="Read ${item.title}"]`)
    })

    it('can be toggled', async () => {
      expect(app.findAll(`[aria-label="Unread ${item.title}"]`).length).not.toEqual(1)
    })

    it('saves to local storage', async () => {
      const localData = await app.getLocalDefaultIdentity()

      expect(localData.items[localData.items.length - 1].readAt).toBeGreaterThan(0)
    })
  })
})
