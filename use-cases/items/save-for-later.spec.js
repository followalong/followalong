import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Items: Save for later', () => {
  describe('from the home page', () => {
    let app
    let item

    beforeEach(async () => {
      app = await mountApp()
      item = { title: 'Foo bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

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
      await app.vm.commands.localStore.getItem(app.initialIdentityId).then((data) => {
        expect(data.items[0].savedAt).toBeGreaterThan(0)
      })
    })
  })

  describe('from the item page', () => {
    let app
    let item

    beforeEach(async () => {
      app = await mountApp()
      item = { title: 'Foo bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="FollowAlong"]')
      await app.click('[aria-label^="Visit"]')
      expect(app.findAll(`[aria-label="Unsave ${item.title}"]`).length).not.toEqual(1)

      await app.click('[aria-label="Toggle Menu"]')
      await app.click(`[aria-label="Save ${item.title}"]`)
      await app.click('[aria-label="Toggle Menu"]')
    })

    it('can be toggled', async () => {
      expect(app.findAll(`[aria-label="Unsave ${item.title}"]`).length).toEqual(1)

      await app.click(`[aria-label="Unsave ${item.title}"]`)
      expect(app.findAll(`[aria-label="Save ${item.title}"]`).length).not.toEqual(1)
    })

    it('saves to local storage', async () => {
      await app.vm.commands.localStore.getItem(app.initialIdentityId).then((data) => {
        expect(data.items[data.items.length - 1].savedAt).toBeGreaterThan(0)
      })
    })
  })
})
