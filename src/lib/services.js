import AWS from 'aws-sdk'
import utils from '@/lib/utils'

function xmlRequest (identity, data) {
  var _ = this
  var x = new XMLHttpRequest()

  return new Promise((resolve, reject) => {
    if (!data.url) return reject(new Error('No URL supplied.'))

    var url = _.data.url || ''

    x.open('GET', url + data.url)

    x.onload = x.onerror = function () {
      if (x.status === 200) {
        resolve({
          status: x.status,
          body: x.responseText
        })
      } else {
        reject(new Error(x.responseText))
      }
    }

    x.send()
  })
}

function lambdaPassthrough (override) {
  override = override || {}

  return function lambdaPassthroughFunc (identity, data) {
    var _ = this

    if (override.obfuscateUrl && data.url) {
      data.url = btoa(data.url)
    }

    return new Promise((resolve, reject) => {
      new AWS.Lambda({
        endpoint: new AWS.Endpoint(override.endpoint || _.data.endpoint),
        accessKeyId: override.accessKeyId || _.data.accessKeyId,
        secretAccessKey: override.secretAccessKey || _.data.secretAccessKey,
        region: override.region || _.data.region,
        apiVersion: 'latest'
      }).invoke({
        FunctionName: override.functionName || _.data.functionName,
        InvocationType: 'RequestResponse',
        LogType: 'None',
        Payload: JSON.stringify(data)
      }, function (err, data) {
        try {
          resolve(JSON.parse(data.Payload))
        } catch (e) {
          reject(err)
        }
      })
    })
  }
}

function s3Sync (identity, data) {
  if (!this.data || !this.data.key || !this.data.bucket || !this.data.accessKeyId || !this.data.secretAccessKey || !this.data.endpoint) {
    return
  }

  var _ = this
  var key = _.data.key.replace(STRIP_SLASHES, '')
  var s3 = new AWS.S3({
    endpoint: new AWS.Endpoint(_.data.endpoint),
    accessKeyId: _.data.accessKeyId,
    secretAccessKey: _.data.secretAccessKey,
    region: _.data.region,
    apiVersion: 'latest',
    maxRetries: 1
  })

  return new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: _.data.bucket,
      Key: key
    }, function (err, oldData) {
      try {
        utils.mergeData(identity, JSON.parse(oldData.Body.toString()))
      } catch (e) { }

      s3.putObject({
        Body: JSON.stringify(data.identity),
        Bucket: _.data.bucket,
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

var STRIP_SLASHES = /^\/|\/$/g
var AWS_CONFIG = {
  endpoint: 'lambda.us-east-1.amazonaws.com',
  region: 'us-east-1',
  accessKeyId: atob('QUtJQVZCVlI1Sk02U002TDVUTEU='),
  secretAccessKey: atob('SFFOQ2RWdVQ3VXc5UUJvU0habTFSd01hdFB5Qm5oTm5iMDdwZXJsVA')
}
// DO_CONFIG = {
//     accessKeyId: atob('REZJQ002N1paWUpGTTRPSUM2Sk4='),
//     secretAccessKey: atob('czFYbHlDeWYzVDB0M21vUHU3dkNoOU9NTjBBK2pKS0ZEbkdwSmpWUWlBOA==')
// };

var SERVICES = [{
  id: 'followalong-free',
  name: 'FollowAlong Free',
  description: 'We\'re offering this as a public service. Your requests may be throttled. We don\'t record or track any data. Don\'t trust us with your traffic? Good! Use our <a href="https://github.com/followalong/followalong/tree/master/server" target="_blank" class="link" onclick="event.stopImmediatePropagation();">template</a> to create your own in minutes!',
  supports: 'rss,search',
  data: {},
  request: lambdaPassthrough({
    endpoint: AWS_CONFIG.endpoint,
    accessKeyId: AWS_CONFIG.accessKeyId,
    secretAccessKey: AWS_CONFIG.secretAccessKey,
    region: AWS_CONFIG.region,
    functionName: 'followalong-passthrough',
    obfuscateUrl: true
  })
},
{
  id: 's3',
  name: 'S3',
  description: 'Store data directly to an S3-compatible server.',
  supports: 'sync',
  data: {
    endpoint: 's3.amazonaws.com',
    key: '/identities/' + utils.generateId() + '.json'
    // accessKeyId: AWS_CONFIG.accessKeyId,
    // secretAccessKey: AWS_CONFIG.secretAccessKey
  },
  fields: {
    name: {
      type: 'text',
      label: 'Service Name',
      required: true
    },
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
  },
  request: s3Sync
},
// {
//   id: 'followalong-unlimited',
//   name: 'FollowAlong Unlimited',
//   description: 'One Year of <strong>unlimited access to our proxy server</strong> AND <strong>fully-encrypted data storage</strong> (eg. we can\'t read it) for $29 USD. No throttling, logging, or tracking.',
//   supports: 'rss,sync',
//   pricing: {
//     stripe: {
//       publishableKey: 'asdf',
//       price: 29,
//       currency: 'USD',
//       method: 'stripe'
//     },
//     bitcoin: {
//       price: 0.0001,
//       currency: 'USD',
//       method: 'bitcoin'
//     }
//   },
//   fields: {
//     name: {
//       type: 'text',
//       label: 'Service Name',
//       required: true
//     },
//     token: {
//       type: 'password',
//       label: 'Token',
//       credential: true,
//       required: true
//     },
//     expiry: {
//       type: 'date',
//       label: 'Expiry Date',
//       disabled: true,
//       credential: true
//     }
//   },
//   data: {},
//   request: lambdaPassthrough({
//     endpoint: AWS_CONFIG.endpoint,
//     accessKeyId: AWS_CONFIG.accessKeyId,
//     secretAccessKey: AWS_CONFIG.secretAccessKey,
//     region: AWS_CONFIG.region,
//     functionName: 'followalong-passthrough',
//     obfuscateUrl: true
//   })
// },
{
  id: 'aws-lambda',
  name: 'AWS Lambda',
  description: 'Use our source code <a href="https://github.com/followalong/followalong" target="_blank" class="link" onclick="event.stopImmediatePropagation();">here</a> to quickly deploy your own passthrough server to Amazon\'s Lambda.',
  supports: 'rss',
  fields: {
    name: {
      type: 'text',
      label: 'Service Name',
      required: true
    },
    endpoint: {
      type: 'text',
      label: 'Endpoint',
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
    region: {
      type: 'text',
      label: 'Region',
      required: true
    },
    functionName: {
      type: 'text',
      label: 'Function Name',
      required: true
    }
  },
  data: {
    region: 'us-east-1',
    endpoint: AWS_CONFIG.endpoint
  },
  request: lambdaPassthrough()
},
{
  id: 'cors-anywhere',
  name: 'CORS Anywhere',
  description: 'Use the "CORS Anywhere" demo server! Please don\'t abuse this service, as you can <a href="https://github.com/Rob--W/cors-anywhere" target="_blank" class="link" onclick="event.stopImmediatePropagation();">quickly deploy your own version</a> to Heroku (or elsewhere).',
  supports: 'rss',
  fields: {
    name: {
      type: 'text',
      label: 'Service Name',
      required: true
    },
    url: {
      type: 'text',
      label: 'URL',
      required: true,
      placeholder: 'https://cors-anywhere.herokuapp.com/'
    }
  },
  data: {
    url: 'https://cors-anywhere.herokuapp.com/'
  },
  request: xmlRequest
},
{
  id: 'followalong-none',
  name: 'None',
  description: 'No service will be used.',
  supports: 'rss,sync,search',
  request (identity, data, done) {
    done()
  }
}]

export default SERVICES
