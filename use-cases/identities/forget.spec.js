import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Identities: Forget', () => {
  it('forgets the identity', async () => {
    window.confirm = () => true

    const app = await mountApp()
    const id = app.vm.identity.id
    app.vm.commands.reload = jest.fn()

    await app.click('[aria-label="Settings"]')
    await app.click('[aria-label="Forget identity"]')

    expect(app.vm.commands.reload).toHaveBeenCalled()
    expect(app.vm.commands.localStore.getItem(id)).resolves.toEqual(null)
  })
})
