import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Services: Change local read limit', () => {
  it('truncates to read items to the most recent 100', async () => {
    const app = await mountApp()
    const identity = app.vm.queries.findDefaultIdentity()
    const feeds = app.vm.queries.feedsForIdentity(identity)
    const items = []
    for (var i = 0; i < 101; i++) {
      items.push({
        title: `Item #${i}`,
        pubDate: new Date().setDate(-i),
        readAt: 1
      })
    }
    app.vm.commands._addItemsForFeed(feeds[0], items)

    await app.vm.commands.saveLocal(identity)

    const data = await app.vm.queries.serviceForIdentity(identity, 'local').db.getItem(identity.id)
    expect(data.items.length).toBeLessThan(101)
  })
})
