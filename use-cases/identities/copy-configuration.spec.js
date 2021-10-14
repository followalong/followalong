import { mountApp, flushPromisesAndTimers, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Identities: Copy configuration', () => {
  it('copies the configuration', async () => {
    window.alert = () => {}

    const app = await mountApp()
    app.vm.commands._copyToClipboard = jest.fn()

    await app.click('[aria-label="Settings"]')
    await app.click('[aria-label="Copy configuration"]')

    expect(app.vm.commands._copyToClipboard).toHaveBeenCalled()
  })
})
