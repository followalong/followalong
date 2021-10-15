import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Identities: Forget', () => {
  it('forgets the identity', async () => {
    window.confirm = () => true

    const app = await mountApp()
    app.vm.commands.reload = jest.fn()

    await app.click('[aria-label="Settings"]')
    await app.click('[aria-label="Forget identity"]')

    expect(app.vm.commands.reload).toHaveBeenCalled()
  })

  it('removes the identity from the local storage', async () => {
    window.confirm = () => true

    const app = await mountApp()
    app.vm.commands.reload = jest.fn()

    await app.click('[aria-label="Settings"]')
    await app.click('[aria-label="Forget identity"]')

    expect(app.vm.commands.localStore.getItem(app.initialIdentityId)).resolves.toEqual(null)
  })
})
