import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

describe('Addons: Change local read limit', () => {
  let app
  let identity

  beforeEach(async () => {
    app = await mountApp()
    identity = app.vm.queries.findDefaultIdentity()
    const feeds = app.vm.queries.feedsForIdentity(identity)
    const items = []
    for (var i = 0; i < 151; i++) {
      items.push({
        title: `Item #${i}`,
        pubDate: new Date().setDate(i),
        readAt: 1
      })
    }
    feeds[0].updatedAt = 0
    app.vm.commands._addItemsForFeed(feeds[0], items)
    await app.vm.commands.saveLocal(identity)
  })

  it('truncates to read items to the default limit', async () => {
    const data = await app.vm.queries.addonForIdentity(identity, 'local').db.getItem(identity.id)
    expect(data.items.length).toEqual(150)
  })

  it('truncates to read items to the set limit', async () => {
    const expectedLimit = 100

    await app.click('[aria-label="Settings"]')
    await app.find('[aria-label="Max read limit"]').setValue(expectedLimit)
    await app.find('[aria-label="Max read limit"]').trigger('blur')
    await app.wait()

    const data = await app.vm.queries.addonForIdentity(identity, 'local').db.getItem(identity.id)
    expect(data.items.length).toEqual(expectedLimit)
  })

  it('truncates read items from the least recent', async () => {
    await app.click('[aria-label="Settings"]')
    await app.find('[aria-label="Max read limit"]').setValue(149)
    await app.find('[aria-label="Max read limit"]').trigger('blur')
    await app.wait()

    const data = await app.vm.queries.addonForIdentity(identity, 'local').db.getItem(identity.id)
    expect(data.items.map((i) => i.title)).not.toContain('Item #1')
  })
})
