import { mountApp, flushPromisesAndTimers } from '../helper.js'

describe('App: Get help', () => {
  it('shows an email address', async () => {
    const app = await mountApp()

    await app.click('[aria-label="Help"]')

    expect(app.text()).toContain('followalong@protonmail.com')
  })
})
