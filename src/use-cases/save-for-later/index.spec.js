import { mountApp, buildIdentityWithFeedAndItems } from '../../../spec/helper.js'

describe('Use Case: Save for later', () => {
  describe('from the home page', () => {
    it('can be marked as read', async () => {
      const expectedTitle = 'An Article'
      const app = await mountApp(buildIdentityWithFeedAndItems([{ isSaved: false, title: expectedTitle }]))
      await app.go('/')

      await app.find(`[aria-label="Save for later: ${expectedTitle}"]`).trigger('click')

      expect(app.vm.identity.items[0].isSaved).toEqual(true)
    })

    it('can be marked as unread', async () => {
      const expectedTitle = 'An Article'
      const app = await mountApp(buildIdentityWithFeedAndItems([{ isSaved: true, title: expectedTitle }]))
      await app.go('/')

      await app.find(`[aria-label="Save for later: ${expectedTitle}"]`).trigger('click')

      expect(app.vm.identity.items[0].isSaved).toEqual(false)
    })
  })

  describe('from the feed page', () => {
    it('can be marked as read', async () => {
      const expectedTitle = 'An Article'
      const app = await mountApp(buildIdentityWithFeedAndItems([{ isSaved: false, title: expectedTitle }]))
      await app.go({ name: 'feed', params: { feed_url: app.vm.identity.feeds[0].url } })

      await app.find(`[aria-label="Save for later: ${expectedTitle}"]`).trigger('click')

      expect(app.vm.identity.items[0].isSaved).toEqual(true)
    })

    it('can be marked as unread', async () => {
      const expectedTitle = 'An Article'
      const app = await mountApp(buildIdentityWithFeedAndItems([{ isSaved: true, title: expectedTitle }]))
      await app.go({ name: 'feed', params: { feed_url: app.vm.identity.feeds[0].url } })

      await app.find(`[aria-label="Save for later: ${expectedTitle}"]`).trigger('click')

      expect(app.vm.identity.items[0].isSaved).toEqual(false)
    })
  })

  describe('from the item page', () => {
    it('can be marked as read', async () => {
      const expectedTitle = 'An Article'
      const app = await mountApp(buildIdentityWithFeedAndItems([{ isSaved: false, title: expectedTitle }]))
      await app.go({ name: 'item', params: { feed_url: app.vm.identity.feeds[0].url, guid: app.vm.identity.items[0].guid } })

      await app.find(`[aria-label="Save for later: ${expectedTitle}"]`).trigger('click')

      expect(app.vm.identity.items[0].isSaved).toEqual(true)
    })

    it('can be marked as unread', async () => {
      const expectedTitle = 'An Article'
      const app = await mountApp(buildIdentityWithFeedAndItems([{ isSaved: true, title: expectedTitle }]))
      await app.go({ name: 'item', params: { feed_url: app.vm.identity.feeds[0].url, guid: app.vm.identity.items[0].guid } })

      await app.find(`[aria-label="Save for later: ${expectedTitle}"]`).trigger('click')

      expect(app.vm.identity.items[0].isSaved).toEqual(false)
    })
  })
})
