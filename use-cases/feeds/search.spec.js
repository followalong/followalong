import { mountApp, buildAddonToRespondWith } from '../helper.js'

describe('Feeds: Search', () => {
  it('shows a listing of new feeds', async () => {
    const app = await mountApp()
    app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('search', [{ name: 'Feed #1' }, { name: 'Feed #2' }])

    await app.submit('[aria-label="Search form"]')

    expect(app.text()).toContain('Feed #1')
    expect(app.text()).toContain('Feed #2')
  })

  it('shows a list of already-subscribed feeds', async () => {
    const existingFeedName = 'My existing feed'
    const app = await mountApp({
      localAddonAdapterData: {
        abc: {
          id: 'abc',
          name: 'Local Name',
          items: [],
          feeds: [{ name: existingFeedName }]
        }
      },
      keychainAdapterData: {
        storedKeys: { abc: 'none' }
      }
    })

    app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('search', [])

    await app.find('[aria-label="Search query"]').setValue('my existing')
    await app.submit('[aria-label="Search form"]')

    expect(app.text()).toContain(existingFeedName)
  })

  it('shows a list of existing items', async () => {
    const existingItemTitle = 'My existing item title'
    const app = await mountApp({
      localAddonAdapterData: {
        abc: {
          id: 'abc',
          name: 'Local Name',
          items: [{ title: existingItemTitle, feedUrl: 'https://example.com' }],
          feeds: [{ url: 'https://example.com' }]
        }
      },
      keychainAdapterData: {
        storedKeys: { abc: 'none' }
      }
    })

    app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('search', [])

    await app.click('[aria-label="Feeds"]')
    await app.find('[aria-label="Search query"]').setValue('my existing')
    await app.submit('[aria-label="Search form"]')

    expect(app.text()).toContain(existingItemTitle)
  })

  it('can subscribe to a feed', async () => {
    const expectedFeed = { name: 'Feed #1' }
    const app = await mountApp()
    const initialFeedsLength = app.vm.queries.allFeeds().length
    app.vm.queries.addonForIdentity = app.buildAddonToRespondWith('search', [expectedFeed, { name: 'Feed #2' }])

    await app.submit('[aria-label="Search form"]')
    await app.click(`[aria-label="Subscribe to ${expectedFeed.name}"]`)
    await app.click('[aria-label="Feeds"]')

    expect(app.text()).toContain(expectedFeed.name)

    const localData = await app.getLocalDefaultIdentity()
    expect(localData.feeds.length).toEqual(initialFeedsLength + 1)
  })
})
