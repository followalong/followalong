import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Items: Listen to content', () => {
  describe('from the item page', () => {
    it('can see a audio player', async () => {
      const app = await mountApp()
      const item = { audioUrl: 'https://example.com/audio.mp3' }
      const feedsLength = app.vm.state.findAll('feeds').length
      app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

      await app.click('[aria-label="Feeds"]')
      await app.click('[aria-label="FollowAlong"]')
      await app.wait()
      await app.click('[aria-label^="Visit item"]')

      expect(app.find('audio source').element.getAttribute('src')).toEqual(item.audioUrl)
    })
  })
})
