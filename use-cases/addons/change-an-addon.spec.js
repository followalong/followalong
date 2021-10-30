import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'

describe('Addons: Update a addon', () => {
  it.todo('can only see addons that are supported')

  it('can be updated', async () => {
    const addonAdapterOptions = {
      fetch: jest.fn(() => Promise.resolve())
    }
    const app = await mountApp({ addonAdapterOptions })
    const feed = app.vm.state.findAll('feeds')[0]

    await app.click('[aria-label="Addons"]')
    await app.click('[aria-label="Change RSS addon"]')
    await app.find('[aria-label="RSS addon name"]').setValue('CORS Anywhere')
    await app.click('[aria-label="Save RSS addon"]')

    expect(app.find('[aria-label="RSS provider"]').text()).toEqual('CORS Anywhere')

    await app.click('[aria-label="Feeds"]')
    await app.click('[aria-label^="Fetch"]')

    expect(addonAdapterOptions.fetch).toHaveBeenCalledWith(feed.url)
  })

  it.todo('can supply a nickname')
  it.todo('can choose a custom addon by nickname')
  it.todo('can supply custom fields')
  // await app.find('[aria-label="RSS addon URL"]').setValue('http://example.com')

  // it.todo('can see password in plain text')
  // it.todo('can be copied')
  // it.todo('can be tested')
  // it.todo('can be downloaded')
})
