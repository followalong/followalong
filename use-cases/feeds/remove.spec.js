import { mountApp, flushPromises, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Feeds: Remove a feed', () => {
  it('is removed from the identity', async () => {
    const app = await mountApp()
    window.confirm = jest.fn(() => true)

    await app.click('[aria-label="Feeds"]')

    const initialFeeds = app.findAll('[aria-label^="Unsubscribe"]').length

    await app.click('[aria-label^="Unsubscribe"]')

    expect(app.findAll('[aria-label^="Unsubscribe"]').length).toEqual(initialFeeds - 1)
  })
})
