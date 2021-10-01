import { mountApp } from '../helper.js'

describe('App: Get help', () => {
  it('runs', async () => {
    const app = await mountApp()

    expect(app.text()).toContain('OK')
  })
})
