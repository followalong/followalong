import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Services: Change local read limit', () => {
  it('truncates to read items to the default limit', async () => {
    const app = await mountApp()
    const identity = app.vm.queries.findDefaultIdentity()
    const feeds = app.vm.queries.feedsForIdentity(identity)
    const items = []
    for (var i = 0; i < 151; i++) {
      items.push({
        title: `Item #${i}`,
        pubDate: new Date().setDate(-i),
        readAt: 1
      })
    }
    app.vm.commands._addItemsForFeed(feeds[0], items)
    await app.vm.commands.saveLocal(identity)

    const data = await app.vm.queries.serviceForIdentity(identity, 'local').db.getItem(identity.id)
    expect(data.items.length).toEqual(150)
  })

  it('truncates to read items to the set limit', async () => {
    const app = await mountApp()
    const identity = app.vm.queries.findDefaultIdentity()
    const feeds = app.vm.queries.feedsForIdentity(identity)
    const items = []
    for (var i = 0; i < 151; i++) {
      items.push({
        title: `Item #${i}`,
        pubDate: new Date().setDate(-i),
        readAt: 1
      })
    }
    app.vm.commands._addItemsForFeed(feeds[0], items)
    await app.vm.commands.saveLocal(identity)

    await app.click('[aria-label="Settings"]')
    await app.find('[aria-label="Max read limit"]').setValue(100)
    await app.find('[aria-label="Max read limit"]').trigger('blur')
    await app.wait()

    const data = await app.vm.queries.serviceForIdentity(identity, 'local').db.getItem(identity.id)
    expect(data.items.length).toEqual(100)
  })
})
