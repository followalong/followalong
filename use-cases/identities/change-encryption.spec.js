import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'
import { encrypt } from '@/queries/helpers/crypt.js'

describe('Identities: Change encryption', () => {
  it('saves the strategy', async () => {
    const app = await mountApp()

    await app.click('[aria-label="Settings"]')
    await app.find('[aria-label="Encryption strategy"]').setValue('rotate')

    await app.click('[aria-label="Feeds"]')
    await app.click('[aria-label="Settings"]')
    expect(app.find('[aria-label="Encryption strategy"]').element.value).toEqual('rotate')
  })

  describe('ask', () => {
    it('asks for a new password', async () => {
      const app = await mountApp()

      await app.click('[aria-label="Settings"]')
      await app.find('[aria-label="Encryption strategy"]').setValue('ask')

      expect(app.vm.keychainAdapter.prompt).toHaveBeenCalled()
    })

    it('saves the new password in memory', async () => {
      const expectedPassword = 'abc-123'
      const app = await mountApp()
      app.vm.keychainAdapter.prompt = jest.fn(() => expectedPassword)

      await app.click('[aria-label="Settings"]')
      await app.find('[aria-label="Encryption strategy"]').setValue('ask')

      const identity = app.vm.queries.findDefaultIdentity()
      expect(app.vm.keychainAdapter.getKey(identity.id)).resolves.toEqual(expectedPassword)
    })

    it('saves the identity as encrypted', async () => {
      const app = await mountApp()
      app.vm.keychainAdapter.prompt = jest.fn(() => 'abc-123')

      await app.click('[aria-label="Settings"]')
      await app.find('[aria-label="Encryption strategy"]').setValue('ask')
      await app.wait()

      const identity = app.vm.queries.findDefaultIdentity()
      const data = await app.vm.localCacheAdapter.db.getItem(identity.id)
      expect(typeof data).toEqual('string')
    })

    describe('update passsword', () => {
      it('saves the new password in memory', async () => {
        const expectedPassword = 'zyx-987'
        const app = await mountApp()
        app.vm.keychainAdapter.prompt = jest.fn(() => 'abc-123')

        await app.click('[aria-label="Settings"]')
        await app.find('[aria-label="Encryption strategy"]').setValue('ask')

        app.vm.keychainAdapter.prompt = jest.fn(() => expectedPassword)
        await app.click('[aria-label="Settings"]')
        await app.click('[aria-label="Change password"]')

        const identity = app.vm.queries.findDefaultIdentity()
        expect(app.vm.keychainAdapter.getKey(identity.id)).resolves.toEqual(expectedPassword)
      })

      it('saves the identity as encrypted', async () => {
        const expectedPassword = 'zyx-987'
        const app = await mountApp()
        app.vm.keychainAdapter.prompt = jest.fn(() => 'abc-123')

        await app.click('[aria-label="Settings"]')
        await app.find('[aria-label="Encryption strategy"]').setValue('ask')

        app.vm.keychainAdapter.prompt = jest.fn(() => expectedPassword)
        await app.click('[aria-label="Settings"]')
        await app.click('[aria-label="Change password"]')

        const identity = app.vm.queries.findDefaultIdentity()
        const data = await app.vm.localCacheAdapter.db.getItem(identity.id)
        expect(typeof data).toEqual('string')
      })
    })

    it('restores the encrypted identity', async () => {
      const expectedPassword = 'zyx-987'
      const app = await mountApp({
        localCacheAdapterData: {
          abc: {
            id: 'abc',
            name: 'My Account',
            items: [{ title: 'Foo Bar' }],
            feeds: [{ name: 'Foo Baz' }],
            encrypt: encrypt(expectedPassword)
          }
        },
        keychainAdapterData: {
          keys: { abc: expectedPassword },
          prompt: () => expectedPassword
        }
      })

      expect(app.text()).toContain('Foo Bar')
    })
  })

  it.todo('rotate')
  it.todo('store')

  describe('none (default)', () => {
    it('saves the identity as unencrypted', async () => {
      const app = await mountApp()

      await app.click('[aria-label="Settings"]')
      await app.find('[aria-label="Encryption strategy"]').setValue('none')
      await app.wait()

      const identity = app.vm.queries.findDefaultIdentity()
      const data = await app.vm.localCacheAdapter.db.getItem(identity.id)
      expect(typeof data).toEqual('object')
    })

    it('removes the all passwords from memory', async () => {
      const expectedPassword = 'zyx-987'
      const app = await mountApp({
        localCacheAdapterData: {
          abc: {
            id: 'abc',
            name: 'My Account',
            items: [{ title: 'Foo Bar' }],
            feeds: [{ name: 'Foo Baz' }],
            encrypt: encrypt(expectedPassword)
          }
        },
        keychainAdapterData: {
          keys: { abc: expectedPassword },
          prompt: () => expectedPassword
        }
      })
      const identity = app.vm.queries.findDefaultIdentity()

      await app.click('[aria-label="Settings"]')
      await app.find('[aria-label="Encryption strategy"]').setValue('none')

      expect(app.vm.keychainAdapter.getKey(identity.id)).resolves.toEqual(undefined)
    })

    it('restores the unencrypted identity', async () => {
      const app = await mountApp({
        localCacheAdapterData: {
          abc: {
            id: 'abc',
            name: 'My Account',
            items: [{ title: 'Foo Bar' }],
            feeds: [{ name: 'Foo Baz' }]
          }
        }
      })

      expect(app.text()).toContain('Foo Bar')
    })
  })
})
