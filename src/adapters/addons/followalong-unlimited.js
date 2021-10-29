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
//       label: 'Addon Name',
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
