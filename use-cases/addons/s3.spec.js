import { mountApp, buildAddonToRespondWith, rawRSSResponse } from '../helper.js'
import AddonAdapter from '@/adapters/addon.js'

describe('Addons: S3', () => {
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
  it.todo('restores the data')
})
