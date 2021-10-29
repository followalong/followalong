import AddonAdapter from '../addon.js'

const STRIP_SLASHES = /^\/|\/$/g

class S3AddonAdapter extends AddonAdapter {
  get () {
    return Promise.reject('`S3AddonAdapter.get` not yet implemented.')
  }

  save (data) {
    var key = this.data.key.replace(STRIP_SLASHES, '')
    var s3 = new AWS.S3({
      endpoint: new AWS.Endpoint(this.data.endpoint),
      accessKeyId: this.data.accessKeyId,
      secretAccessKey: this.data.secretAccessKey,
      region: this.data.region,
      apiVersion: 'latest',
      maxRetries: 1
    })

    return new Promise((resolve, reject) => {
      s3.getObject({
        Bucket: this.data.bucket,
        Key: key
      }, function (err, oldData) {
        try {
          // utils.mergeData(identity, JSON.parse(oldData.Body.toString()))
        } catch (e) { }

        s3.putObject({
          Body: JSON.stringify(data.identity),
          Bucket: this.data.bucket,
          Key: key
        }, function (err) {
          identity.saveLocal().then(() => {
            if (err) {
              return reject(err)
            }

            resolve(data.identity)
          })
        })
      })
    })
  }

  remove () {
    return Promise.reject('`S3AddonAdapter.remove` not yet implemented.')
  }
}

// {
//   id: 's3',
//   name: 'S3',
//   description: 'Store data directly to an S3-compatible server.',
//   supports: 'sync',
//   data: {
//     endpoint: 's3.amazonaws.com',
//     key: '/identities/' + generateId() + '.json'
//     // accessKeyId: AWS_CONFIG.accessKeyId,
//     // secretAccessKey: AWS_CONFIG.secretAccessKey
//   },
//   fields: {
//     name: {
//       type: 'text',
//       label: 'Addon Name',
//       required: true
//     },
//     endpoint: {
//       type: 'text',
//       label: 'Endpoint',
//       required: true
//     },
//     region: {
//       type: 'text',
//       label: 'Region',
//       required: true
//     },
//     key: {
//       type: 'text',
//       label: 'Key',
//       required: true
//     },
//     accessKeyId: {
//       type: 'text',
//       label: 'Access Key ID',
//       required: true
//     },
//     secretAccessKey: {
//       type: 'password',
//       label: 'Secret Access Key',
//       required: true
//     },
//     bucket: {
//       type: 'text',
//       label: 'Bucket',
//       required: true
//     }
//   },
//   request: s3Sync
// },

export default S3AddonAdapter
