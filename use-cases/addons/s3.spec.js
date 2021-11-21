import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'
import AddonAdapter from '@/adapters/addon.js'

describe('Addons: S3', () => {
  describe('save', () => {
    let putObject
    let getObject
    let awsS3
    let awsEndpoint
    let app

    beforeEach(async () => {
      putObject = jest.fn()
      getObject = jest.fn()
      awsS3 = jest.fn(() => {
        return { getObject, putObject }
      })
      awsEndpoint = jest.fn((url) => url)
      app = await mountApp({
        addonAdapterOptions: {
          awsEndpoint,
          awsS3
        }
      })

      await app.click('[aria-label="Addons"]')
      await app.click('[aria-label="Change Sync addon"]')
      await app.find('[aria-label="Sync addon type"]').setValue('s3')
      await app.find('[aria-label="Sync addon endpoint"]').setValue('endpoint')
      await app.find('[aria-label="Sync addon key"]').setValue('key')
      await app.find('[aria-label="Sync addon accessKeyId"]').setValue('accessKeyId')
      await app.find('[aria-label="Sync addon secretAccessKey"]').setValue('secretAccessKey')
      await app.find('[aria-label="Sync addon bucket"]').setValue('bucket')
      await app.submit('[aria-label="Save Sync addon"]')
    })

    it('can save the configuration', async () => {
      expect(app.find('[aria-label="Sync provider"]').text()).toContain('S3 (bucketkey)')
    })

    it('sends the data', () => {
      const expectedBody = JSON.stringify(new AddonAdapter().format(app.vm.queries.identityToRemote(app.vm.identity)))
      expect(awsEndpoint).toHaveBeenCalledWith('endpoint')
      expect(awsS3).toHaveBeenCalledWith({
        endpoint: 'endpoint',
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        apiVersion: 'latest',
        maxRetries: 1
      })
      expect(putObject).toHaveBeenCalledWith({
        Body: expect.any(String),
        Bucket: 'bucket',
        Key: 'key'
      }, expect.any(Function))
    })

    it.todo('sends encrypted data')
  })

  describe('restore', () => {
    it('passes through when set to none', async () => {
      const expectedName = 'Local Name'
      const app = await mountApp({
        addonAdapterOptions: {},
        localAddonAdapterData: {
          abc: {
            id: 'abc',
            name: expectedName,
            items: [],
            feeds: [],
            addons: {
              sync: {
                adapter: 'none'
              }
            }
          }
        },
        keychainAdapterData: {
          storedKeys: { abc: 'none' }
        }
      })

      await app.click('[aria-label="Settings"]')

      expect(app.find('[aria-label="Identity name"]').element.value).toEqual(expectedName)
    })

    it('restores the identity name', async () => {
      const expectedName = 'Remote Name'
      const putObject = jest.fn()
      const getObject = jest.fn((data, done) => {
        done(null, {
          name: expectedName
        })
      })
      const awsS3 = jest.fn(() => {
        return { getObject, putObject }
      })
      const awsEndpoint = jest.fn((url) => url)
      const app = await mountApp({
        addonAdapterOptions: {
          awsEndpoint,
          awsS3
        },
        localAddonAdapterData: {
          abc: {
            id: 'abc',
            name: 'Local Name',
            items: [],
            feeds: [],
            addons: {
              sync: {
                adapter: 's3'
              }
            }
          }
        },
        keychainAdapterData: {
          storedKeys: { abc: 'none' }
        }
      })

      await app.click('[aria-label="Settings"]')

      expect(app.find('[aria-label="Identity name"]').element.value).toEqual(expectedName)
    })

    it('restores the identity hints', async () => {
      const expectedHints = ['hint']
      const putObject = jest.fn()
      const getObject = jest.fn((data, done) => {
        done(null, {
          hints: expectedHints
        })
      })
      const awsS3 = jest.fn(() => {
        return { getObject, putObject }
      })
      const awsEndpoint = jest.fn((url) => url)
      const app = await mountApp({
        addonAdapterOptions: {
          awsEndpoint,
          awsS3
        },
        localAddonAdapterData: {
          abc: {
            id: 'abc',
            name: 'Local Name',
            items: [],
            feeds: [],
            addons: {
              sync: {
                adapter: 's3'
              }
            }
          }
        },
        keychainAdapterData: {
          storedKeys: { abc: 'none' }
        }
      })

      expect(app.vm.identity.hints).toEqual(expectedHints)
    })

    it('restores new feeds', async () => {
      const expectedUrl = 'http://example.com'
      const putObject = jest.fn()
      const getObject = jest.fn((data, done) => {
        done(null, {
          feeds: [{
            url: expectedUrl
          }]
        })
      })
      const awsS3 = jest.fn(() => {
        return { getObject, putObject }
      })
      const awsEndpoint = jest.fn((url) => url)
      const app = await mountApp({
        addonAdapterOptions: {
          awsEndpoint,
          awsS3
        },
        localAddonAdapterData: {
          abc: {
            id: 'abc',
            name: 'Local Name',
            items: [],
            feeds: [],
            addons: {
              sync: {
                adapter: 's3'
              }
            }
          }
        },
        keychainAdapterData: {
          storedKeys: { abc: 'none' }
        }
      })

      await app.click('[aria-label="Feeds"]')

      expect(app.text()).toContain(expectedUrl)
    })

    it('restores existing feeds', async () => {
      const expectedUrl = 'http://example.com'
      const expectedPausedAt = 7
      const putObject = jest.fn()
      const getObject = jest.fn((data, done) => {
        done(null, {
          feeds: [{
            url: expectedUrl,
            pausedAt: expectedPausedAt,
            updatedAt: Date.now()
          }]
        })
      })
      const awsS3 = jest.fn(() => {
        return { getObject, putObject }
      })
      const awsEndpoint = jest.fn((url) => url)
      const app = await mountApp({
        addonAdapterOptions: {
          awsEndpoint,
          awsS3
        },
        localAddonAdapterData: {
          abc: {
            id: 'abc',
            name: 'Local Name',
            items: [],
            feeds: [{
              url: expectedUrl
            }],
            addons: {
              sync: {
                adapter: 's3'
              }
            }
          }
        },
        keychainAdapterData: {
          storedKeys: { abc: 'none' }
        }
      })

      await app.click('[aria-label="Feeds"]')
      const localData = await app.getLocalDefaultIdentity()

      expect(localData.feeds[0].pausedAt).toBeGreaterThan(0)
      expect(await app.findAll('[aria-label^="Unpause"]').length).toEqual(1)
    })

    it('restores new saved items', async () => {
      const feedUrl = 'http://example.com'
      const expectedPausedAt = 7
      const putObject = jest.fn()
      const getObject = jest.fn((data, done) => {
        done(null, {
          items: [{
            feedUrl: feedUrl,
            savedAt: Date.now()
          }]
        })
      })
      const awsS3 = jest.fn(() => {
        return { getObject, putObject }
      })
      const awsEndpoint = jest.fn((url) => url)
      const app = await mountApp({
        addonAdapterOptions: {
          awsEndpoint,
          awsS3
        },
        localAddonAdapterData: {
          abc: {
            id: 'abc',
            name: 'Local Name',
            items: [],
            feeds: [{
              url: feedUrl
            }],
            addons: {
              sync: {
                adapter: 's3'
              }
            }
          }
        },
        keychainAdapterData: {
          storedKeys: { abc: 'none' }
        }
      })

      await app.click('[aria-label="Saved"]')
      const localData = await app.getLocalDefaultIdentity()

      expect(localData.items[0].savedAt).toBeGreaterThan(0)
      expect(await app.findAll('[aria-label^="Unsave"]').length).toEqual(1)
    })

    it('restores existing saved items', async () => {
      const feedUrl = 'http://example.com'
      const expectedPausedAt = 7
      const putObject = jest.fn()
      const getObject = jest.fn((data, done) => {
        done(null, {
          items: [{
            guid: 'abc-123',
            feedUrl: feedUrl,
            savedAt: Date.now()
          }]
        })
      })
      const awsS3 = jest.fn(() => {
        return { getObject, putObject }
      })
      const awsEndpoint = jest.fn((url) => url)
      const app = await mountApp({
        addonAdapterOptions: {
          awsEndpoint,
          awsS3
        },
        localAddonAdapterData: {
          abc: {
            id: 'abc',
            name: 'Local Name',
            items: [{
              guid: 'abc-123',
              feedUrl: feedUrl
            }],
            feeds: [{
              url: feedUrl
            }],
            addons: {
              sync: {
                adapter: 's3'
              }
            }
          }
        },
        keychainAdapterData: {
          storedKeys: { abc: 'none' }
        }
      })

      await app.click('[aria-label="Saved"]')
      const localData = await app.getLocalDefaultIdentity()

      expect(localData.items[0].savedAt).toBeGreaterThan(0)
      expect(await app.findAll('[aria-label^="Unsave"]').length).toEqual(1)
    })

    it('restores addons', async () => {
      const feedUrl = 'http://example.com'
      const expectedPausedAt = 7
      const putObject = jest.fn()
      const getObject = jest.fn((data, done) => {
        done(null, {
          addons: {
            sync: {
              adapter: 's3',
              changed: 'changed'
            }
          }
        })
      })
      const awsS3 = jest.fn(() => {
        return { getObject, putObject }
      })
      const awsEndpoint = jest.fn((url) => url)
      const app = await mountApp({
        addonAdapterOptions: {
          awsEndpoint,
          awsS3
        },
        localAddonAdapterData: {
          abc: {
            id: 'abc',
            name: 'Local Name',
            items: [],
            feeds: [],
            addons: {
              sync: {
                adapter: 's3'
              }
            }
          }
        },
        keychainAdapterData: {
          storedKeys: { abc: 'none' }
        }
      })

      const localData = await app.getLocalDefaultIdentity()

      expect(localData.addons.sync.changed).toEqual('changed')
    })

    it.todo('loads encrypted data')
  })
})
