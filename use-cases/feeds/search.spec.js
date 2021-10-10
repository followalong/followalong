import { mountApp, flushPromises } from '../helper.js'

describe('Feeds: Search', () => {
  it('shows a listing of feeds', async () => {
    const app = await mountApp()
    app.vm.queries.serviceForIdentity = jest.fn(() => {
      return {
        request (identity, data, done) {
          done(undefined, [{ name: 'Feed #1' }, { name: 'Feed #2' }])
        }
      }
    })
    const $form = app.find('[aria-label="Search form"]')

    await $form.trigger('submit')
    await flushPromises()

    expect(app.text()).toContain('Feed #1')
    expect(app.text()).toContain('Feed #2')
  })

  it('redirects if only 1 result', async () => {
    const expectedFeed = { name: 'Feed #1', url: 'https://example.com/feed' }
    const app = await mountApp()
    app.vm.commands.fetchFeed = jest.fn()
    app.vm.queries.findFeedByUrl = jest.fn(() => expectedFeed)
    app.vm.queries.serviceForIdentity = jest.fn(() => {
      return {
        request (identity, data, done) {
          done(undefined, [expectedFeed])
        }
      }
    })
    const $form = app.find('[aria-label="Search form"]')

    await $form.trigger('submit')
    await flushPromises()

    expect(app.text()).toContain(`You're all caught up on ${expectedFeed.name}!`)
  })
})
