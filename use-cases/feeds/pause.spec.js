import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

describe('Feeds: Pause a feed', () => {
  let app
  let feedsLength

  beforeEach(async () => {
    app = await mountApp()
    feedsLength = app.vm.queries.allFeeds().length
    const item = { title: 'Foo Bar' }
    app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('rss', rawRSSResponse(item))

    await app.click('[aria-label="Feeds"]')
    await app.click('[aria-label^="Pause"]')
    await app.click('[aria-label="Fetch all feeds"]')
  })

  it('does not fetch a paused feed', async () => {
    expect(app.vm.queries.addonForIdentity(app.vm.identity, 'rss').rss).toHaveBeenCalledTimes(feedsLength - 1)
  })

  it('saves the identity in local storage', async () => {
    const localData = await app.getLocalDefaultIdentity()

    expect(localData.feeds[0].pausedAt).toBeGreaterThan(0)
  })
})
