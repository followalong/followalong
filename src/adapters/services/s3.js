import ServiceAdapter from '../service.js'

const STRIP_SLASHES = /^\/|\/$/g

class S3ServiceAdapter extends ServiceAdapter {
  get () {
    return Promise.reject('`S3ServiceAdapter.get` not yet implemented.')
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
    return Promise.reject('`S3ServiceAdapter.remove` not yet implemented.')
  }
}

export default S3ServiceAdapter
