class ServiceAdapter {
  constructor (adapterOptions, serviceData) {
    this.data = serviceData

    for (const key in adapterOptions) {
      this[key] = adapterOptions[key]
    }
  }

  rss () {
    return Promise.reject(new Error('`RSS` is not supported by this service.'))
  }

  search () {
    return Promise.reject(new Error('`Search` is not supported by this service.'))
  }
}

class LocalServiceAdapter extends ServiceAdapter {
  constructor (adapterOptions, serviceData) {
    super(adapterOptions, serviceData)

    this.data.encryptionStrategy = this.data.encryptionStrategy || 'none'
  }
}

class FollowAlongFreeServiceAdapter extends ServiceAdapter {
  constructor (adapterOptions, serviceData) {
    super(adapterOptions, serviceData)

    this.AWS_CONFIG = {
      endpoint: 'lambda.us-east-1.amazonaws.com',
      region: 'us-east-1',
      accessKeyId: atob('QUtJQVZCVlI1Sk02U002TDVUTEU='),
      secretAccessKey: atob('SFFOQ2RWdVQ3VXc5UUJvU0habTFSd01hdFB5Qm5oTm5iMDdwZXJsVA')
    }
  }

  _request (data) {
    return new Promise((resolve, reject) => {
      new this.AWS.Lambda({
        endpoint: new this.AWS.Endpoint(this.AWS_CONFIG.endpoint),
        accessKeyId: this.AWS_CONFIG.accessKeyId,
        secretAccessKey: this.AWS_CONFIG.secretAccessKey,
        region: this.AWS_CONFIG.region,
        apiVersion: 'latest'
      }).invoke({
        FunctionName: 'followalong-passthrough',
        InvocationType: 'RequestResponse',
        LogType: 'None',
        Payload: JSON.stringify(data)
      }, function (err, data) {
        if (err) {
          return reject(err)
        }

        try {
          resolve(JSON.parse(data.Payload))
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  rss (url) {
    return this._request({
      action: 'rss',
      url: btoa(url)
    })
  }

  search (q) {
    return this._request({
      action: 'search',
      q
    })
  }
}

ServiceAdapter.build = (type, adapterOptions, identity) => {
  identity.services = identity.services || {}
  identity.services[type] = identity.services[type] || {}

  if (type === 'local') {
    return new LocalServiceAdapter(adapterOptions, identity.services[type])
  } else {
    return new FollowAlongFreeServiceAdapter(adapterOptions, identity.services[type])
  }
}

export default ServiceAdapter

// class S3ServiceAdapter extends ServiceAdapter {
//   sync () {
//     return (identity, data) => {
//       if (!this.data || !this.data.key || !this.data.bucket || !this.data.accessKeyId || !this.data.secretAccessKey || !this.data.endpoint) {
//         return
//       }
//
//       var _ = this
//       var key = _.data.key.replace(STRIP_SLASHES, '')
//       var s3 = new AWS.S3({
//         endpoint: new AWS.Endpoint(_.data.endpoint),
//         accessKeyId: _.data.accessKeyId,
//         secretAccessKey: _.data.secretAccessKey,
//         region: _.data.region,
//         apiVersion: 'latest',
//         maxRetries: 1
//       })
//
//       return new Promise((resolve, reject) => {
//         s3.getObject({
//           Bucket: _.data.bucket,
//           Key: key
//         }, function (err, oldData) {
//           try {
//             // utils.mergeData(identity, JSON.parse(oldData.Body.toString()))
//           } catch (e) { }
//
//           s3.putObject({
//             Body: JSON.stringify(data.identity),
//             Bucket: _.data.bucket,
//             Key: key
//           }, function (err) {
//             identity.saveLocal().then(() => {
//               if (err) {
//                 return reject(err)
//               }
//
//               resolve(data.identity)
//             })
//           })
//         })
//       })
//     }
//   }
// }
