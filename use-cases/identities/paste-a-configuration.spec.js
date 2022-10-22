import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

let app
let copiedConfiguration
const identityName = 'Account Name'
const identity = {
  id: 'abc',
  name: identityName,
  items: [{ title: 'Foo Bar', savedAt: Date.now() }],
  feeds: [{ name: 'Foo Baz' }]
}
const localAddonAdapterData = {
  abc: identity
}
const keychainAdapterData = {
  storedKeys: { abc: 'none' }
}

window.alert = jest.fn()

describe('Identities: Paste configuration', () => {
  beforeEach(async () => {
    const tempApp = await mountApp({ localAddonAdapterData, keychainAdapterData })

    tempApp.vm.commands.copyToClipboard = jest.fn((configuration) => { copiedConfiguration = configuration })
    tempApp.vm.commands.copyConfig(tempApp.vm.identity)

    app = await mountApp()

    await app.click('[aria-label="Add identity"]')
    await app.find('[aria-label="Paste configuration"]').setValue(copiedConfiguration)
    await app.submit('[aria-label="Create identity from configuration"]')
  })

  it('restores the identity details', async () => {
    expect(app.text()).toContain(identityName)
  })

  it('restores the items', async () => {
    await app.click('[aria-label="What\'s new?"]')

    expect(app.text()).toContain(identity.items[0].title)
  })

  it('restores the feeds', async () => {
    await app.click('[aria-label="Feeds"]')

    expect(app.text()).toContain(identity.feeds[0].name)
  })

  it('restores saved items', async () => {
    await app.click('[aria-label="Saved"]')

    expect(app.text()).toContain(identity.items[0].title)
  })
})
