import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Identities: Catch up on all', () => {
  it('marks all items as read', async () => {
    const app = await mountApp()
    app.vm.queries.serviceForIdentity = buildServiceToRespondWith('rss', rawRSSResponse({ title: 'Foo Bar' }))

    await app.click('[aria-label="FollowAlong"]')
    expect(app.findAll('.read').length).toEqual(0)

    await app.click('[aria-label="Catch up on all"]')
    expect(app.findAll('.read').length).toBeGreaterThan(0)
  })
})
