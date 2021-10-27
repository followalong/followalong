import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Feeds: Pause a feed', () => {
  let app
  let feedsLength

  beforeEach(async () => {
    app = await mountApp()
    feedsLength = app.vm.queries.allFeeds().length
    const item = { title: 'Foo Bar' }
    app.vm.queries.serviceForIdentity = buildServiceToRespondWith('rss', rawRSSResponse(item))

    await app.click('[aria-label="Feeds"]')
    await app.click('[aria-label^="Pause"]')
    await app.click('[aria-label="FollowAlong"]')
  })

  it('does not fetch a paused feed', async () => {
    expect(app.vm.queries.serviceForIdentity().rss).toHaveBeenCalledTimes(feedsLength - 1)
  })

  it('saves the identity in local storage', async () => {
    const localData = await app.getLocalDefaultIdentity()

    expect(localData.feeds[0].pausedAt).toBeGreaterThan(0)
  })
})
