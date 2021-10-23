import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Identities: Restore from local', () => {
  let app
  let localCacheAdapterData

  beforeEach(async () => {
    localCacheAdapterData = [{
      id: 'abc-123',
      name: 'My Account',
      items: [{ title: 'Foo Bar', savedAt: Date.now() }],
      feeds: [{ name: 'Foo Baz' }]
    }]
    app = await mountApp({ localCacheAdapterData })
  })

  it('restores the identity details', async () => {
    await app.click('[aria-label="Settings"]')

    expect(app.text()).toContain(localCacheAdapterData[0].name)
  })

  it('restores the items', async () => {
    expect(app.text()).toContain(localCacheAdapterData[0].items[0].title)
  })

  it('restores the feeds', async () => {
    await app.click('[aria-label="Feeds"]')

    expect(app.text()).toContain(localCacheAdapterData[0].feeds[0].name)
  })

  it('restores saved items', async () => {
    await app.click('[aria-label="Saved"]')

    expect(app.text()).toContain(localCacheAdapterData[0].items[0].title)
  })
})
