import { mountApp } from '../../../spec/helper.js'

describe('Use Case: Change encryption strategy', () => {
  it('can visit the settings page', async () => {
    const app = await mountApp()
    await app.go('/settings')

    expect(app.text()).toContain('Local Data Encryption')
  })

  describe('Simple encryption', () => {
    it.todo('saves the strategy')
    it.todo('does not save the strategy if no key is supplied')
    it.todo('asks for a new key')
    it.todo('does not save the new key')
    it.todo('can decrypt the data when the page is reloaded')
  })

  describe('Rotate keys', () => {
    it.todo('saves the strategy')
    it.todo('saves the new key')
    it.todo('updates the key when the page is reloaded')
    it.todo('can decrypt the data when the page is reloaded')
  })

  describe('Store the key', () => {
    it.todo('saves the strategy')
    it.todo('does not save the strategy if no key is supplied')
    it.todo('asks for a new key')
    it.todo('saves the new key')
    it.todo('remembers the key when the page is reloaded')
    it.todo('can decrypt the data when the page is reloaded')
  })

  describe('Unencrypted', () => {
    it.todo('saves the strategy')
    it.todo('saves data unencrypted')
    it.todo('can read the data when the page is reloaded')
  })
})
