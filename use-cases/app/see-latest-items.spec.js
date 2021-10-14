import { mountApp, flushPromisesAndTimers } from '../helper.js'

describe('App: See latest items', () => {
  it('see ', async () => {
    const app = await mountApp()

    expect(app.find('h1').text()).toContain('What\'s New?')
  })
})
