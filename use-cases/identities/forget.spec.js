import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Identities: Forget', () => {
  let app

  beforeEach(async () => {
    window.confirm = () => true

    app = await mountApp()
    app.vm.commands.reload = jest.fn()

    await app.click('[aria-label="Settings"]')
    await app.click('[aria-label="Forget identity"]')
  })

  it('forgets the identity', async () => {
    expect(app.vm.commands.reload).toHaveBeenCalled()
  })

  it('removes the identity from the local storage', async () => {
    expect(app.vm.commands.localStore.getItem(app.initialIdentityId)).resolves.toEqual(null)
  })
})
