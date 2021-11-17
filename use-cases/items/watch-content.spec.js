import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

describe('Items: Watch content', () => {
  describe('from the item page', () => {
    it('can see a video player', async () => {
      const app = await mountApp()
      const item = { videoUrl: 'https://example.com/video.mp4' }
      app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('rss', rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="Fetch all feeds"]')
      await app.click('[aria-label="FollowAlong"]')
      await app.click('[aria-label^="Visit item"]')

      expect(app.find('iframe').element.getAttribute('src')).toEqual(item.videoUrl)
    })
  })
})
