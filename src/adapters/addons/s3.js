// const STRIP_SLASHES = /^\/|\/$/g

import AddonAdapter from '../addon.js'

class S3AddonAdapter extends AddonAdapter {
  constructor (adapterOptions, addonData) {
    super(adapterOptions, addonData)

    this.adapter = 's3'
    this.name = this.data.name || 'S3'
    this.supports = []
  }
}

export default S3AddonAdapter

// get () {
//   return Promise.reject(new Error('`S3AddonAdapter.get` not yet implemented.'))
// }

//   save (data) {
//     var key = this.data.key.replace(STRIP_SLASHES, '')
//     var s3 = new this.AWS.S3({
//       endpoint: new this.AWS.Endpoint(this.data.endpoint),
//       accessKeyId: this.data.accessKeyId,
//       secretAccessKey: this.data.secretAccessKey,
//       region: this.data.region,
//       apiVersion: 'latest',
//       maxRetries: 1
//     })
//
//     return new Promise((resolve, reject) => {
//       s3.getObject({
//         Bucket: this.data.bucket,
//         Key: key
//       }, function (err, oldData) {
//         try {
//           // utils.mergeData(identity, JSON.parse(oldData.Body.toString()))
//         } catch (e) { }
//
//         s3.putObject({
//           Body: JSON.stringify(data.identity),
//           Bucket: this.data.bucket,
//           Key: key
//         }, function (err) {
//           data.identity.saveLocal().then(() => {
//             if (err) {
//               return reject(err)
//             }
//
//             resolve(data.identity)
//           })
//         })
//       })
//     })
//   }
//
//   remove () {
//     return Promise.reject(new Error('`S3AddonAdapter.remove` not yet implemented.'))
//   }
// }

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
