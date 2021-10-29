import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

describe('Feeds: Unsubscribe from a feed', () => {
  let app
  let initialFeedsLength

  beforeEach(async () => {
    app = await mountApp()
    window.confirm = jest.fn(() => true)

    await app.click('[aria-label="Feeds"]')

    initialFeedsLength = app.findAll('[aria-label^="Unsubscribe"]').length

    await app.click('[aria-label^="Unsubscribe"]')
  })

  it('is removed from the identity', async () => {
    expect(app.findAll('[aria-label^="Unsubscribe"]').length).toEqual(initialFeedsLength - 1)
  })

  it('saves the identity in local storage', async () => {
    const localData = await app.getLocalDefaultIdentity()

    expect(localData.feeds.length).toEqual(initialFeedsLength - 1)
  })
})
