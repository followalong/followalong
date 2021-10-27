import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Identities: Restore from local', () => {
  let app
  let localServiceAdapterData
  let keychainAdapterData

  beforeEach(async () => {
    localServiceAdapterData = {
      abc: {
        id: 'abc',
        name: 'My Account',
        items: [{ title: 'Foo Bar', savedAt: Date.now() }],
        feeds: [{ name: 'Foo Baz' }]
      }
    }
    keychainAdapterData = {
      storedKeys: { abc: 'none' }
    }
    app = await mountApp({ localServiceAdapterData, keychainAdapterData })
  })

  it('restores the identity details', async () => {
    await app.click('[aria-label="Settings"]')

    expect(app.text()).toContain(localServiceAdapterData.abc.name)
  })

  it('restores the items', async () => {
    expect(app.text()).toContain(localServiceAdapterData.abc.items[0].title)
  })

  it('restores the feeds', async () => {
    await app.click('[aria-label="Feeds"]')

    expect(app.text()).toContain(localServiceAdapterData.abc.feeds[0].name)
  })

  it('restores saved items', async () => {
    await app.click('[aria-label="Saved"]')

    expect(app.text()).toContain(localServiceAdapterData.abc.items[0].title)
  })
})
