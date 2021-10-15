import { mountApp, buildServiceToRespondWith, rawRSSResponse } from '../helper.js'

describe('Identities: Change nickname', () => {
  it('updates the nickname', async () => {
    const expectedName = 'Foo bar'
    const app = await mountApp()

    await app.click('[aria-label="Settings"]')
    await app.find('[aria-label="Identity name"]').setValue(expectedName)

    await app.click('[aria-label="Help"]')
    await app.click('[aria-label="Settings"]')
    expect(app.find('[aria-label="Identity name"]').element.value).toEqual(expectedName)
  })
})
