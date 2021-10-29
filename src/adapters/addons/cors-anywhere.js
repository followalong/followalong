// function xmlRequest (identity, data) {
//   var _ = this
//   var x = new XMLHttpRequest()
//
//   return new Promise((resolve, reject) => {
//     if (!data.url) return reject(new Error('No URL supplied.'))
//
//     var url = _.data.url || ''
//
//     x.open('GET', url + data.url)
//
//     x.onload = x.onerror = function () {
//       if (x.status === 200) {
//         resolve({
//           status: x.status,
//           body: x.responseText
//         })
//       } else {
//         reject(new Error(x.responseText))
//       }
//     }
//
//     x.send()
//   })
// }

// {
//   id: 'cors-anywhere',
//   name: 'CORS Anywhere',
//   description: 'Use the "CORS Anywhere" demo server! Please don\'t abuse this addon, as you can <a href="https://github.com/Rob--W/cors-anywhere" target="_blank" class="link" onclick="event.stopImmediatePropagation();">quickly deploy your own version</a> to Heroku (or elsewhere).',
//   supports: 'rss',
//   fields: {
//     name: {
//       type: 'text',
//       label: 'Addon Name',
//       required: true
//     },
//     url: {
//       type: 'text',
//       label: 'URL',
//       required: true,
//       placeholder: 'https://cors-anywhere.herokuapp.com/'
//     }
//   },
//   data: {
//     url: 'https://cors-anywhere.herokuapp.com/'
//   },
//   request: xmlRequest
// },
