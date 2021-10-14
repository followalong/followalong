import { mountApp, flushPromisesAndTimers, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Items: Save for later', () => {
  describe('from the home page', () => {
    it('can be toggled', async () => {
      const app = await mountApp()
      const item = { title: 'Foo bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="FollowAlong"]')
      await flushPromisesAndTimers()
      expect(app.findAll(`[aria-label="Unsave ${item.title}"]`).length).not.toEqual(1)

      await app.click(`[aria-label="Save ${item.title}"]`)
      expect(app.findAll(`[aria-label="Unsave ${item.title}"]`).length).toEqual(1)

      await app.click(`[aria-label="Unsave ${item.title}"]`)
      expect(app.findAll(`[aria-label="Save ${item.title}"]`).length).not.toEqual(1)
    })
  })

  describe('from the item page', () => {
    it('can be toggled', async () => {
      const app = await mountApp()
      const item = { title: 'Foo bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="FollowAlong"]')
      await flushPromisesAndTimers()
      await app.click('[aria-label^="Visit"]')
      expect(app.findAll(`[aria-label="Unsave ${item.title}"]`).length).not.toEqual(1)

      await app.click('[aria-label="Toggle Menu"]')
      await app.click(`[aria-label="Save ${item.title}"]`)
      await app.click('[aria-label="Toggle Menu"]')
      expect(app.findAll(`[aria-label="Unsave ${item.title}"]`).length).toEqual(1)

      await app.click(`[aria-label="Unsave ${item.title}"]`)
      expect(app.findAll(`[aria-label="Save ${item.title}"]`).length).not.toEqual(1)
    })
  })
})
