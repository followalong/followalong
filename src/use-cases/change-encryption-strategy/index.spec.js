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

  describe('ask every page load', () => {
    it.todo('saves the strategy')
    it.todo('does not save the strategy if no key is supplied')
    it.todo('asks for a new key')
    it.todo('does not save the key')
    it.todo('can restore the data')
  })

  describe('rotate keys', () => {
    it.todo('saves the strategy')
    it.todo('saves the new key')
    it.todo('updates the key upon every save')
    it.todo('can restore the data')
  })

  describe('store the key', () => {
    it.todo('saves the strategy')
    it.todo('does not save the strategy if no key is supplied')
    it.todo('asks for a new key')
    it.todo('saves the new key')
    it.todo('can restore the data')
  })

  describe('no encryption', () => {
    it('saves the strategy', async () => {
      const app = await visitSettings({ services: { local: { strategy: 'foo' } } })
      app.vm.identity.save = jest.fn()

      app.find('[aria-label="Select local data strategy"]').setValue('none')

      expect(app.vm.identity.services.local.strategy).toEqual('none')
      expect(app.vm.identity.save).toHaveBeenCalled()
    })

    it('saves data unencrypted', async () => {
      const app = await visitSettings({ services: { local: { strategy: 'none' } } })
      app.vm.identity.services.sync.request = jest.fn()

      app.vm.identity.sync().then(() => {
        expect(app.vm.identity.services.sync.request).toHaveBeenCalledWith(app.vm.identity, {
          action: 'sync',
          identity: app.vm.identity.toRemote()
        })
      })
    })

    it.todo('can restore the data')
  })
})
