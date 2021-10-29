import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

describe('Identities: Download configuration', () => {
  it('downloads the configuration', async () => {
    window.alert = () => {}

    const app = await mountApp()
    app.vm.commands.saveAs = jest.fn()

    await app.click('[aria-label="Settings"]')
    await app.click('[aria-label="Download identity"]')

    expect(app.vm.commands.saveAs).toHaveBeenCalled()
  })
})
