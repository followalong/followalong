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
    //     it('saves the profile as encrypted', () => {
    //       const app = await mountApp()
    //
    //       await app.click('[aria-label="Settings"]')
    //       await app.find('[aria-label="Encryption strategy"]').setValue('rotate')
    //
    //       await app.click('[aria-label="Feeds"]')
    //       await app.click('[aria-label="Settings"]')
    //       expect(app.find('[aria-label="Encryption strategy"]').element.value).toEqual('rotate')
    //     })

    it.todo('restores the encrypted profile')
    it.todo('can reset the passsword')
  })

  it.todo('rotate')
  it.todo('store')
  it.todo('none')
})
