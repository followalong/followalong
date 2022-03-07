import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

describe('Items: Notify new items', () => {
  describe('from the background', () => {
    let app
    let item

    beforeEach(async () => {
      app = await mountApp()

      app.vm.state.data.feeds[0].updatedAt = 0

      item = { title: 'Foo Bar' }
      app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('rss', rawRSSResponse(item))

      app.vm.commands.noAutomaticFetches = false
      app.vm.commands.fetchNextFeedPerpetually(app.vm.identity)

      await app.wait()
    })

    it('shows the new item notification', async () => {
      expect(app.find('[aria-label="Show new items"]').text()).toContain('1 new item')
    })

    it('can show the new items', async () => {
      await app.click('[aria-label="Show new items"]')

      expect(app.text()).toContain(item.title)
    })
  })
})
