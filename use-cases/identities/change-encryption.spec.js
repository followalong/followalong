import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

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
      expect(app.vm.keychainAdapter.getKey(identity.id)).toEqual(expectedPassword)
    })

    it('saves the profile as encrypted', async () => {
      const expectedPassword = 'abc-123'
      const app = await mountApp()

      await app.click('[aria-label="Settings"]')
      await app.find('[aria-label="Encryption strategy"]').setValue('ask')

      const identity = await app.getLocalDefaultIdentity()
      expect(typeof identity).toEqual('string')
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
        expect(app.vm.keychainAdapter.getKey(identity.id)).toEqual(expectedPassword)
      })

      it('saves the profile as encrypted', async () => {
        const expectedPassword = 'zyx-987'
        const app = await mountApp()
        app.vm.keychainAdapter.prompt = jest.fn(() => 'abc-123')

        await app.click('[aria-label="Settings"]')
        await app.find('[aria-label="Encryption strategy"]').setValue('ask')

        app.vm.keychainAdapter.prompt = jest.fn(() => expectedPassword)
        await app.click('[aria-label="Settings"]')
        await app.click('[aria-label="Change password"]')

        const identity = await app.getLocalDefaultIdentity()
        expect(typeof identity).toEqual('string')
      })
    })

    it.todo('restores the encrypted profile')
  })

  it.todo('rotate')
  it.todo('store')
  it.todo('none')
})
