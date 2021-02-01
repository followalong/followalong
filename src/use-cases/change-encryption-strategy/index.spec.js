import { mountApp } from '../../../spec/helper.js'
import store from '@/store'

const visitSettings = async (identity) => {
  const app = await mountApp(identity)

  await app.go('/settings')

  return app
}

describe('Use Case: Change encryption strategy', () => {
  describe('initializes the settings page', () => {
    it('shows the correct account', async () => {
      const expectedName = 'Foo Bar'
      const app = await visitSettings({ name: expectedName })

      expect(app.text()).toContain('Setup')
      expect(app.text()).toContain(expectedName)
    })

    it('shows current strategy', async () => {
      const expectedStrategy = 'rotate'
      const app = await visitSettings({ services: { local: { strategy: expectedStrategy } } })

      expect(app.find('[aria-label="Select data encryption strategy"]').element.value).toEqual(expectedStrategy)
    })
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

      app.find('[aria-label="Select data encryption strategy"]').setValue('none')

      expect(app.vm.identity.save).toHaveBeenCalled()
      expect(app.vm.identity.services.local.strategy).toEqual('none')
    })

    it('saves the key to the keychain', async () => {
      const identityId = '123'
      const app = await visitSettings({ id: identityId, services: { local: { strategy: 'foo' } } })

      app.find('[aria-label="Select data encryption strategy"]').setValue('none')

      expect(await store.getItem(`key-${identityId}`)).toEqual('none')
    })

    it('saves data unencrypted', async () => {
      const app = await visitSettings({
        services: {
          local: { strategy: 'none' },
          sync: { symlink: 'followalong-free' }
        }
      })
      app.vm.identity.sync = jest.fn(() => Promise.resolve())

      await app.vm.identity.save()

      expect(app.vm.identity.sync).toHaveBeenCalledWith(app.vm.identity.toRemote())
    })

    it('can restore the data', async () => {
      const expectedIdentity = { id: 'foo', name: 'Bar', services: { local: { strategy: 'none' } } }
      const app = await visitSettings(expectedIdentity)

      expect(app.vm.identity.id).toEqual(expectedIdentity.id)
    })
  })
})
