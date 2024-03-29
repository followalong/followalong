import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

describe('Items: Read content', () => {
  describe('from the item page', () => {
    it('can see the full content', async () => {
      const app = await mountApp()
      const item = { title: 'Foo bar', content: 'Foo baz' }
      app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('rss', rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="Fetch all feeds"]')
      await app.click('[aria-label="FollowAlong"]')
      await app.click('[aria-label^="Visit item"]')

      expect(app.text()).toContain(item.title)
      expect(app.text()).toContain(item.content)
    })
  })
})
