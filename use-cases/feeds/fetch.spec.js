import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Feeds: Fetch', () => {
  describe('from the feeds page', () => {
    let app
    let item

    beforeEach(async () => {
      app = await mountApp()
      item = { title: 'Foo Bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith('rss', rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label^="Fetch"]')
      await app.click('[aria-label^="Visit"]')
    })

    it('fetches new items', async () => {
      expect(app.text()).toContain(item.title)
    })

    it('saves to local storage', async () => {
      const localData = await app.getLocalDefaultIdentity()

      expect(localData.items.length).toBeGreaterThan(0)
    })
  })

  describe('from the feed page', () => {
    let app
    let item

    beforeEach(async () => {
      app = await mountApp()
      item = { title: 'Foo Bar' }
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith('rss', rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label^="Visit"]')
      await app.click('[aria-label="Toggle Menu"]')
      await app.click('[aria-label^="Fetch"]')
    })

    it('fetches new items', async () => {
      expect(app.text()).toContain(item.title)
    })

    it('saves to local storage', async () => {
      const localData = await app.getLocalDefaultIdentity()

      expect(localData.items.length).toBeGreaterThan(0)
    })
  })

  it('newly-fetched old items are marked as read', async () => {
    const app = await mountApp()
    const feed = app.vm.state.findAll('feeds')[0]
    const item = { guid: 123, title: 'Foo Bar', pubDate: new Date() }
    app.vm.queries.serviceForIdentity = buildServiceToRespondWith('rss', rawRSSResponse(item))

    await app.click('[aria-label="Feeds"]')
    await app.click('[aria-label^="Visit"]')
    await app.click('[aria-label="Toggle Menu"]')
    await app.click('[aria-label^="Fetch"]')
    await app.click(`[aria-label="Read ${item.title}"]`)

    const oldItem = { guid: 456, title: 'Baz Bar', pubDate: new Date(0) }
    app.vm.queries.serviceForIdentity = buildServiceToRespondWith('rss', rawRSSResponse(oldItem))
    await app.click('[aria-label="Toggle Menu"]')
    await app.click('[aria-label^="Fetch"]')

    expect(app.findAll(`[aria-label="Unread ${oldItem.title}"]`).length).toEqual(1)
  })
})
