import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Feeds: Pause a feed', () => {
  it('does not fetch a paused feed', async () => {
    const app = await mountApp()
    const item = { title: 'Foo Bar' }
    const feedsLength = app.vm.state.findAll('feeds').length
    app.vm.queries.serviceForIdentity = buildServiceToRespondWith(rawRSSResponse(item))

    await app.click('[aria-label="Feeds"]')
    await app.click('[aria-label^="Pause"]')
    await app.click('[aria-label="FollowAlong"]')
    await app.wait()

    expect(app.vm.queries.serviceForIdentity).toHaveBeenCalledTimes(feedsLength - 1)
  })
})
