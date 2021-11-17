import AddonAdapter from '../addon.js'

const STRIP_BEGINNING_AND_END_SLASHES = /^\/|\/$/g

class S3AddonAdapter extends AddonAdapter {
  constructor (adapterOptions, addonData) {
    super(adapterOptions, addonData)

    this.adapter = 's3'
    this.name = this.data.name || 'S3'
    this.description = 'Store data directly to an S3-compatible server.'
    this.supports = ['sync']
    this.data.key = this.data.key || '/identities/' + 'generateId()' + '.json'
    this.data.endpoint = this.data.endpoint || 's3.amazonaws.com'
    this.fields = {
      endpoint: {
        type: 'text',
        label: 'Endpoint',
        required: true
      },
      region: {
        type: 'text',
        label: 'Region',
        required: true
      },
      key: {
        type: 'text',
        label: 'Key',
        required: true
      },
      accessKeyId: {
        type: 'text',
        label: 'Access Key ID',
        required: true
      },
      secretAccessKey: {
        type: 'password',
        label: 'Secret Access Key',
        required: true
      },
      bucket: {
        type: 'text',
        label: 'Bucket',
        required: true
      }
    }
  }

  save (identityData, encrypt) {
    var key = this.data.key.replace(STRIP_BEGINNING_AND_END_SLASHES, '')
    var s3 = this.awsS3({
      endpoint: this.awsEndpoint(this.data.endpoint),
      accessKeyId: this.data.accessKeyId,
      secretAccessKey: this.data.secretAccessKey,
      region: this.data.region,
      apiVersion: 'latest',
      maxRetries: 1
    })

    return new Promise((resolve, reject) => {
      // s3.getObject({
      //   Bucket: this.data.bucket,
      //   Key: key
      // }, function (err, oldData) {
      //   try {
      //     // utils.mergeData(identity, JSON.parse(oldData.Body.toString()))
      //   } catch (e) { }
      // })

      const data = encrypt(this.format(identityData))

      s3.putObject({
        Body: typeof data === 'string' ? data : JSON.stringify(data),
        Bucket: this.data.bucket,
        Key: key
      }, function (err) {
        if (err) {
          return reject(err)
        }

        resolve()
      })
    })
  }

  preview () {
    return `${this.data.name || this.name} (${this.data.bucket}${this.data.key})`
  }
}

export default S3AddonAdapter
