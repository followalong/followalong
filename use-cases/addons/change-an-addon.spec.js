import { mountApp, buildAddonToRespondWith, rawRSSResponse, rawRSS } from '../helper.js'

describe('Addons: Update a addon', () => {
  it.todo('can only see addons that are supported')

  it('can be updated', async () => {
    const addonAdapterOptions = {
      fetch: jest.fn(() => Promise.resolve({
        ok: true,
        status: 200,
        text () {
          return rawRSS({})
        }
      }))
    }
    const app = await mountApp({ addonAdapterOptions })
    const lastFeed = app.vm.state.findAll('feeds')[app.vm.state.findAll('feeds').length - 1]

    await app.click('[aria-label="Addons"]')
    await app.click('[aria-label="Change RSS addon"]')
    await app.find('[aria-label="RSS addon type"]').setValue('cors-anywhere')
    await app.submit('[aria-label="Save RSS addon"]')

    expect(app.find('[aria-label="RSS provider"]').text()).toEqual('CORS Anywhere (https://followalong-cors-anywhere.herokuapp.com/)')

    await app.click('[aria-label="Feeds"]')
    await app.click('[aria-label^="Fetch"]')
    await app.wait()

    const corsURL = app.vm.queries.addonForIdentity(app.vm.identity, 'rss').data.url
    expect(addonAdapterOptions.fetch).toHaveBeenCalledWith(corsURL + lastFeed.url)
  })

  it('can supply custom fields', async () => {
    const addonAdapterOptions = {
      fetch: jest.fn(() => Promise.resolve({
        ok: true,
        status: 200,
        text () {
          return rawRSS({})
        }
      }))
    }
    const app = await mountApp({ addonAdapterOptions })
    const lastFeed = app.vm.state.findAll('feeds')[app.vm.state.findAll('feeds').length - 1]
    const expectedCorsURL = 'https://example.com/'

    await app.click('[aria-label="Addons"]')
    await app.click('[aria-label="Change RSS addon"]')
    await app.find('[aria-label="RSS addon type"]').setValue('cors-anywhere')
    await app.find('[aria-label="RSS addon url"]').setValue(expectedCorsURL)
    await app.submit('[aria-label="Save RSS addon"]')

    expect(app.find('[aria-label="RSS provider"]').text()).toEqual('CORS Anywhere (https://example.com/)')

    await app.click('[aria-label="Feeds"]')
    await app.click('[aria-label^="Fetch"]')
    await app.wait()

    expect(addonAdapterOptions.fetch).toHaveBeenCalledWith(expectedCorsURL + lastFeed.url)
  })

  it.todo('can choose a custom addon by nickname')
  it.todo('can see password in plain text')
  it.todo('can be copied')
  it.todo('can be tested')
  it.todo('can be downloaded')
})
