import { mountApp } from '../../../spec/helper.js'
import store from '@/store'
import crypt from '@/components/app/crypt.js'

const visitSettings = async (identity, identityId, identityKey) => {
  const app = await mountApp(identity, identityId, identityKey)

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
    it('saves the strategy when a new key is supplied', async () => {
      const app = await visitSettings({ services: { local: { strategy: 'foo' } } })
      app.vm.identity.save = jest.fn()
      global.prompt = jest.fn(() => 'password')

      await app.find('[aria-label="Select data encryption strategy"]').setValue('ask')

      expect(app.vm.identity.save).toHaveBeenCalled()
      expect(app.vm.identity.services.local.strategy).toEqual('ask')
    })

    it('does not save the strategy if no key is supplied', async () => {
      const app = await visitSettings({ services: { local: { strategy: 'foo' } } })
      app.vm.identity.save = jest.fn()
      global.prompt = jest.fn(() => null)

      await app.find('[aria-label="Select data encryption strategy"]').setValue('ask')

      expect(app.vm.identity.save).not.toHaveBeenCalled()
      expect(app.vm.identity.services.local.strategy).toEqual('foo')
    })

    it('saves the key in memory', async () => {
      const expectedId = '567'
      const expectedPassword = 'password'
      const app = await visitSettings({ id: expectedId, services: { local: { strategy: 'foo' } } })
      global.prompt = jest.fn(() => expectedPassword)

      await app.find('[aria-label="Select data encryption strategy"]').setValue('ask')

      expect(app.vm.keychain[expectedId]).toEqual(expectedPassword)
    })

    it('does not save the key in store', async () => {
      const expectedId = '567'
      const app = await visitSettings({ id: expectedId, services: { local: { strategy: 'foo' } } })
      app.vm.identity.save = jest.fn()
      global.prompt = jest.fn(() => 'password')

      await app.find('[aria-label="Select data encryption strategy"]').setValue('ask')

      expect(await store.getItem(`key-${expectedId}`)).toEqual('ask')
    })

    it('can restore the data', async () => {
      const expectedName = 'Bob'
      const expectedId = '123'
      const expectedKey = 'password'
      const identity = { id: expectedId, name: expectedName, feeds: [], items: [], hints: [], services: { local: { strategy: 'ask' } } }
      const encryptedIdentity = crypt.en({ '123': expectedKey }, store, identity, identity)
      global.prompt = jest.fn(() => expectedKey)

      const app = await visitSettings(encryptedIdentity, expectedId, 'ask')

      expect(app.vm.identity.id).toEqual(expectedId)
      expect(app.vm.identity.name).toEqual(expectedName)
    })
  })

  describe('rotate keys', () => {
    it('saves the strategy', async () => {
      const app = await visitSettings({ services: { local: { strategy: 'foo' } } })
      app.vm.identity.save = jest.fn()

      await app.find('[aria-label="Select data encryption strategy"]').setValue('rotate')

      expect(app.vm.identity.save).toHaveBeenCalled()
      expect(app.vm.identity.services.local.strategy).toEqual('rotate')
    })

    it('saves the new key in memory', async () => {
      const app = await visitSettings({ services: { local: { strategy: 'foo' } } })

      await app.find('[aria-label="Select data encryption strategy"]').setValue('rotate')

      expect(app.vm.keychain[app.vm.identity.id].length).toBeGreaterThan(10)
    })

    it.todo('updates the local and stored key upon every save')
    it.todo('uses the key to store the identity')
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
      const expectedId = '123'
      const app = await visitSettings({ id: expectedId, services: { local: { strategy: 'foo' } } })

      app.find('[aria-label="Select data encryption strategy"]').setValue('none')

      expect(await store.getItem(`key-${expectedId}`)).toEqual('none')
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
