import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

let app

describe('Identities: Toggle identities', () => {
  beforeEach(async () => {
    app = await mountApp()

    // await app.click('[aria-label="Add identity"]')
    // await app.find('[aria-label="Paste configuration"]').setValue(copiedConfiguration)
    // await app.submit('[aria-label="Create identity from configuration"]')
  })

  it.todo('switches the identity'/*, async () => {
    expect(app.text()).toContain(profile.name)
  } */)
})
