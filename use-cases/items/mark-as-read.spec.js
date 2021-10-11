import { mountApp, flushPromises, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Items: Mark as read', () => {
  describe('from the home page', () => {
    it('can be toggled', async () => {
      const app = await mountApp()
      const item = { title: 'Foo bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="FollowAlong"]')
      expect(app.findAll(`[aria-label="Unread ${item.title}"]`).length).not.toEqual(1)

      await app.click(`[aria-label="Read ${item.title}"]`)
      expect(app.findAll(`[aria-label="Unread ${item.title}"]`).length).toEqual(1)

      await app.click(`[aria-label="Unread ${item.title}"]`)
      expect(app.findAll(`[aria-label="Read ${item.title}"]`).length).not.toEqual(1)
    })
  })

  describe('from the item page', () => {
    it('can be toggled', async () => {
      const app = await mountApp()
      const item = { title: 'Foo bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="FollowAlong"]')
      await app.click('[aria-label^="Visit"]')
      expect(app.findAll(`[aria-label="Unread ${item.title}"]`).length).not.toEqual(1)

      await app.click('[aria-label="Toggle Menu"]')
      await app.click(`[aria-label="Unread ${item.title}"]`)
      await app.click('[aria-label="Toggle Menu"]')
      expect(app.findAll(`[aria-label="Read ${item.title}"]`).length).toEqual(1)

      await app.click(`[aria-label="Read ${item.title}"]`)
      expect(app.findAll(`[aria-label="Unread ${item.title}"]`).length).not.toEqual(1)
    })
  })
})
