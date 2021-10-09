import { mountApp, buildIdentityWithFeedAndItems } from '../helper.js'

describe('Use Case: Mark item as read', () => {
  it('runs', () => {})
//   describe('from the home page', () => {
//     it('can be marked as read', async () => {
//       const expectedTitle = 'An Article'
//       const app = await mountApp(buildIdentityWithFeedAndItems([{ isRead: false, title: expectedTitle }]))
//       await app.go('/')
//
//       await app.find(`[aria-label="Mark as read: ${expectedTitle}"]`).trigger('click')
//
//       expect(app.vm.identity.items[0].isRead).toEqual(true)
//     })
//
//     it('can be marked as unread', async () => {
//       const expectedTitle = 'An Article'
//       const app = await mountApp(buildIdentityWithFeedAndItems([{ isRead: true, title: expectedTitle }]))
//       await app.go('/')
//
//       await app.find(`[aria-label="Mark as read: ${expectedTitle}"]`).trigger('click')
//
//       expect(app.vm.identity.items[0].isRead).toEqual(false)
//     })
//   })
//
//   describe('from the feed page', () => {
//     it('can be marked as read', async () => {
//       const expectedTitle = 'An Article'
//       const app = await mountApp(buildIdentityWithFeedAndItems([{ isRead: false, title: expectedTitle }]))
//       await app.go({ name: 'feed', params: { feed_url: app.vm.identity.feeds[0].url } })
//
//       await app.find(`[aria-label="Mark as read: ${expectedTitle}"]`).trigger('click')
//
//       expect(app.vm.identity.items[0].isRead).toEqual(true)
//     })
//
//     it('can be marked as unread', async () => {
//       const expectedTitle = 'An Article'
//       const app = await mountApp(buildIdentityWithFeedAndItems([{ isRead: true, title: expectedTitle }]))
//       await app.go({ name: 'feed', params: { feed_url: app.vm.identity.feeds[0].url } })
//
//       await app.find(`[aria-label="Mark as read: ${expectedTitle}"]`).trigger('click')
//
//       expect(app.vm.identity.items[0].isRead).toEqual(false)
//     })
//   })
//
//   describe('from the item page', () => {
//     it('is marked as read on page load', async () => {
//       const app = await mountApp(buildIdentityWithFeedAndItems([{}]))
//
//       await app.go({ name: 'item', params: { feed_url: app.vm.identity.feeds[0].url, guid: app.vm.identity.items[0].guid } })
//
//       expect(app.vm.identity.items[0].isRead).toEqual(true)
//     })
//
//     it('can be marked as read', async () => {
//       const expectedTitle = 'An Article'
//       const app = await mountApp(buildIdentityWithFeedAndItems([{ title: expectedTitle }]))
//       await app.go({ name: 'item', params: { feed_url: app.vm.identity.feeds[0].url, guid: app.vm.identity.items[0].guid } })
//       app.vm.identity.items[0].isRead = false
//
//       await app.find(`[aria-label="Mark as read: ${expectedTitle}"]`).trigger('click')
//
//       expect(app.vm.identity.items[0].isRead).toEqual(true)
//     })
//
//     it('can be marked as unread', async () => {
//       const expectedTitle = 'An Article'
//       const app = await mountApp(buildIdentityWithFeedAndItems([{ title: expectedTitle }]))
//       await app.go({ name: 'item', params: { feed_url: app.vm.identity.feeds[0].url, guid: app.vm.identity.items[0].guid } })
//       app.vm.identity.items[0].isRead = true
//
//       await app.find(`[aria-label="Mark as read: ${expectedTitle}"]`).trigger('click')
//
//       expect(app.vm.identity.items[0].isRead).toEqual(false)
//     })
//   })
})
