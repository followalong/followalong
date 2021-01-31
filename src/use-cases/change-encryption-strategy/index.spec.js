import { mountApp, flushPromises } from '../../../spec/helper.js'

const visitSettings = async (identity) => {
  const app = await mountApp({
    identities: [identity || {}]
  })

  await flushPromises()
  await app.go('/settings')

  return app
}

describe('Use Case: Change encryption strategy', () => {
  it('can visit the settings page', async () => {
    const app = await visitSettings()

    expect(app.text()).toContain('Account Name')
  })

  describe('Ask every page load', () => {
    it.todo('saves the strategy')
    it.todo('does not save the strategy if no key is supplied')
    it.todo('asks for a new key')
    it.todo('does not save the new key')
    it.todo('can decrypt the data when the page is reloaded')
  })

  describe('Rotate keys', () => {
    it.todo('saves the strategy')
    it.todo('saves the new key')
    it.todo('updates the key when the page is reloaded')
    it.todo('can decrypt the data when the page is reloaded')
  })

  describe('Store the key', () => {
    it.todo('saves the strategy')
    it.todo('does not save the strategy if no key is supplied')
    it.todo('asks for a new key')
    it.todo('saves the new key')
    it.todo('remembers the key when the page is reloaded')
    it.todo('can decrypt the data when the page is reloaded')
  })

  describe('No encryption', () => {
    it('saves the strategy', async () => {
      const app = await visitSettings({ services: { local: { strategy: 'foo' } } })
      app.vm.identity.save = jest.fn()

      app.find('[aria-label="Select local data strategy"]').setValue('none')

      expect(app.vm.identity.services.local.strategy).toEqual('none')
      expect(app.vm.identity.save).toHaveBeenCalled()
    })

    it.todo('saves data unencrypted')
    it.todo('can read the data when the page is reloaded')
  })
})
