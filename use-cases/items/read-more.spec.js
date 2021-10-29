import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

describe('Items: Read more', () => {
  describe('from the home page', () => {
    it('can show the full content', async () => {
      window.scroll = () => {}
      const app = await mountApp()
      const item = { title: 'Foo bar', content: 'word '.repeat(1000) }
      app.vm.queries.addonForIdentity = buildAddonToRespondWith('rss', rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="FollowAlong"]')
      await app.click(`[aria-label="Read more ${item.title}"]`)

      expect(app.text()).toContain(item.content)
    })

    it('scrolls to content', async () => {
      window.scroll = jest.fn()
      const app = await mountApp()
      const item = { title: 'Foo bar', content: 'word '.repeat(1000) }
      app.vm.queries.addonForIdentity = buildAddonToRespondWith('rss', rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="FollowAlong"]')
      await app.click(`[aria-label="Read more ${item.title}"]`)

      expect(window.scroll).toHaveBeenCalled()
    })
  })
})
