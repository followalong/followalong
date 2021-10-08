import { mountApp } from '../helper.js'
import store from '@/store'
import crypt from '@/components/app/crypt.js'
import keychain from '@/keychain.js'

const visitSettings = async (identity, identityId, identityKey) => {
  const app = await mountApp(identity, identityId, identityKey)

  await app.go('/settings')

  return app
}

describe('Use Case: Change encryption strategy', () => {
  beforeEach(() => {
    global.prompt = undefined
  })

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
      global.prompt = jest.fn(() => '34567')

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
      const expectedId = '78654'
      const expectedKey = '456789'
      const app = await visitSettings({ id: expectedId, services: { local: { strategy: 'foo' } } })
      global.prompt = jest.fn(() => expectedKey)

      await app.find('[aria-label="Select data encryption strategy"]').setValue('ask')

      expect(keychain.getKey(expectedId)).toEqual(expectedKey)
    })

    it('does not save the key in store', async () => {
      const expectedId = '8371'
      const app = await visitSettings({ id: expectedId, services: { local: { strategy: 'foo' } } })
      global.prompt = jest.fn(() => '8594')

      await app.find('[aria-label="Select data encryption strategy"]').setValue('ask')

      expect(await keychain.getKeyInStore(expectedId)).toEqual('ask')
    })

    it('can reset the key', async () => {
      const expectedId = '586795'
      const expectedKey = '968797'
      const app = await visitSettings({ id: expectedId, services: { local: { strategy: 'foo' } } })
      global.prompt = jest.fn(() => expectedKey)

      await app.find('[aria-label="Select data encryption strategy"]').setValue('ask')
      await app.find('[aria-label="Reset secret key"]').trigger('click')

      expect(global.prompt).toHaveBeenCalled()
      expect(keychain.getKey(expectedId)).toEqual(expectedKey)
    })

    it('can restore the data', async () => {
      const expectedName = 'Bob'
      const expectedId = '6889549'
      const expectedKey = '3049589'
      const identity = { id: expectedId, name: expectedName, feeds: [], items: [], hints: [], services: { local: { strategy: 'ask' } } }
      const encryptedIdentity = crypt.en(keychain, store, identity, identity)
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

      expect(keychain.getKey(app.vm.identity.id).length).toBeGreaterThan(10)
    })

    it('saves the new key in storage', async () => {
      const app = await visitSettings({ services: { local: { strategy: 'foo' } } })

      await app.find('[aria-label="Select data encryption strategy"]').setValue('rotate')

      expect(await keychain.getKey(app.vm.identity.id)).toEqual(keychain.getKey(app.vm.identity.id))
    })

    it('uses the key to encrypt the stored the identity', async () => {
      const app = await visitSettings({ id: '123', name: 'Super Account', services: { local: { strategy: 'foo' } } })

      await app.find('[aria-label="Select data encryption strategy"]').setValue('rotate')

      const encryptedIdentity = crypt.en(keychain, store, app.vm.identity, app.vm.identity.toLocal())
      const decryptedIdentity = crypt.de(keychain, store, app.vm.identity, encryptedIdentity)
      const decryptedStoredIdentity = crypt.de(keychain, store, app.vm.identity, await store.getItem(app.vm.identity.id))
      expect(decryptedStoredIdentity).toEqual(decryptedIdentity)
    })

    it('can restore the data', async () => {
      const expectedName = 'Bob'
      const expectedId = '78678'
      const expectedKey = '89875'
      const identity = { id: expectedId, name: expectedName, feeds: [], items: [], hints: [], services: { local: { strategy: 'rotate' } } }
      await keychain.saveKey(expectedId, expectedKey)
      const encryptedIdentity = crypt.en(keychain, store, identity, identity)
      global.prompt = jest.fn(() => expectedKey)

      const app = await visitSettings(encryptedIdentity, expectedId, expectedKey)

      expect(app.vm.identity.id).toEqual(expectedId)
      expect(app.vm.identity.name).toEqual(expectedName)
    })
  })

  describe('store the key', () => {
    it('saves the strategy when a new key is supplied', async () => {
      const app = await visitSettings({ services: { local: { strategy: 'foo' } } })
      app.vm.identity.save = jest.fn()
      global.prompt = jest.fn(() => '7829304')

      await app.find('[aria-label="Select data encryption strategy"]').setValue('store')

      expect(app.vm.identity.save).toHaveBeenCalled()
      expect(app.vm.identity.services.local.strategy).toEqual('store')
    })

    it('does not save the strategy if no key is supplied', async () => {
      const app = await visitSettings({ services: { local: { strategy: 'foo' } } })
      app.vm.identity.save = jest.fn()
      global.prompt = jest.fn(() => null)

      await app.find('[aria-label="Select data encryption strategy"]').setValue('store')

      expect(app.vm.identity.save).not.toHaveBeenCalled()
      expect(app.vm.identity.services.local.strategy).toEqual('foo')
    })

    it('saves the key in memory', async () => {
      const expectedId = '7664'
      const expectedKey = '456789'
      const app = await visitSettings({ id: expectedId, services: { local: { strategy: 'foo' } } })
      global.prompt = jest.fn(() => expectedKey)

      await app.find('[aria-label="Select data encryption strategy"]').setValue('store')

      expect(keychain.getKey(expectedId)).toEqual(expectedKey)
    })

    it('saves the key in store', async () => {
      const expectedId = '657453'
      const expectedKey = '985987'
      const app = await visitSettings({ id: expectedId, services: { local: { strategy: 'foo' } } })
      global.prompt = jest.fn(() => expectedKey)

      await app.find('[aria-label="Select data encryption strategy"]').setValue('store')

      expect(await keychain.getKey(expectedId)).toEqual(expectedKey)
    })

    it('can restore the data', async () => {
      const expectedName = 'Bob'
      const expectedId = '57654'
      const expectedKey = '3049589'
      const identity = { id: expectedId, name: expectedName, feeds: [], items: [], hints: [], services: { local: { strategy: 'ask' } } }
      await keychain.saveKey(expectedId, expectedKey)
      const encryptedIdentity = crypt.en(keychain, store, identity, identity)
      global.prompt = jest.fn(() => expectedKey)

      const app = await visitSettings(encryptedIdentity, expectedId, expectedKey)

      expect(app.vm.identity.id).toEqual(expectedId)
      expect(app.vm.identity.name).toEqual(expectedName)
    })
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
      const expectedId = '67576'
      const app = await visitSettings({ id: expectedId, services: { local: { strategy: 'foo' } } })

      app.find('[aria-label="Select data encryption strategy"]').setValue('none')

      expect(await keychain.getKey(`${expectedId}`)).toEqual('none')
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
      const expectedIdentity = { id: '787435', name: 'Bar', services: { local: { strategy: 'none' } } }
      const app = await visitSettings(expectedIdentity)

      expect(app.vm.identity.id).toEqual(expectedIdentity.id)
    })
  })
})
