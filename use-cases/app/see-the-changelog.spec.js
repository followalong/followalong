import { mountApp, flushPromisesAndTimers } from '../helper.js'

describe('App: See the changelog', () => {
  it('unveils the story', async () => {
    const app = await mountApp()

    await app.click('[aria-label="See the changelog"]')

    expect(app.find('h1').text()).toContain('Changelog')
  })
})
