import { mountApp } from '../helper.js'

describe('App: Read about FollowAlong', () => {
  it('unveils the story', async () => {
    const app = await mountApp()

    await app.click('[aria-label="About FollowAlong"]')

    expect(app.find('h1').text()).toContain('Our Story')
  })
})
