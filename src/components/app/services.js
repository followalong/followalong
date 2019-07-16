var AWS_CONFIG = {
    sdk: '/js/aws-sdk-2.444.0.min.js',
    region: 'us-east-1',
    accessKeyId: atob('QUtJQVZCVlI1Sk02U002TDVUTEU='),
    secretAccessKey: atob('SFFOQ2RWdVQ3VXc5UUJvU0habTFSd01hdFB5Qm5oTm5iMDdwZXJsVA')
};

export default [{
    id: 'followalong-lite',
    name: 'FollowAlong Throttled',
    description: '(limited to 1 request per minute) Use this server to test out FollowAlong.',
    data: {
        accessKeyId: AWS_CONFIG.accessKeyId,
        secretAccessKey: AWS_CONFIG.secretAccessKey,
        region: AWS_CONFIG.region,
        functionName: 'followalong-passthrough'
    },
    fetch: function fetch(app, identity, data, done) {
        var _ = this;

        app.cachedLoadExternal(AWS_CONFIG.sdk, function() {
            window.AWS.config.update({
                accessKeyId: _.data.accessKeyId,
                secretAccessKey: _.data.secretAccessKey,
                region: _.data.region
            });

            new window.AWS.Lambda({
                region: _.data.region,
                apiVersion: '2015-03-31'
            }).invoke({
                FunctionName: _.data.functionName,
                InvocationType: 'RequestResponse',
                LogType: 'None',
                Payload: JSON.stringify({
                    url: data.url
                })
            }, function(err, data) {
                try {
                    done(undefined, JSON.parse(data.Payload));
                } catch (e) {
                    done(err);
                }
            });
        });
    }
},
// {
//     id: 'followalong-unlimited',
//     name: 'FollowAlong Unlimited',
//     description: ' (9 USD per year) Unfortunately, data fetching and transfer is not free to us, so we offer a simple option for you to cover the expenses.',
//     data: {
//         accessKeyId: AWS_CONFIG.accessKeyId,
//         secretAccessKey: AWS_CONFIG.secretAccessKey,
//         region: AWS_CONFIG.region,
//         functionName: 'followalong-passthrough'
//     },
//     fetch: function fetch(app, identity, data, done) {
//         var _ = this;

//         app.cachedLoadExternal(AWS_CONFIG.sdk, function() {
//             window.AWS.config.update({
//                 accessKeyId: _.data.accessKeyId,
//                 secretAccessKey: _.data.secretAccessKey,
//                 region: _.data.region
//             });

//             new window.AWS.Lambda({
//                 region: _.data.region,
//                 apiVersion: '2015-03-31'
//             }).invoke({
//                 FunctionName: _.data.functionName,
//                 InvocationType: 'RequestResponse',
//                 LogType: 'None',
//                 Payload: JSON.stringify({
//                     url: data.url
//                 })
//             }, function(err, data) {
//                 try {
//                     done(undefined, JSON.parse(data.Payload));
//                 } catch (e) {
//                     done(err);
//                 }
//             });
//         });
//     }
// },
{
    id: 'cors-anywhere',
    name: 'CORS Anywhere',
    description: 'This is the "CORS Anywhere" demo server! Please deploy your own version to Heroku (or elsewhere) and change the URL. Deploy your own: https://github.com/Rob--W/cors-anywhere.',
    fields: {
        url: {
            type: 'input',
            label: 'URL',
            required: true,
            placeholder: 'https://cors-anywhere.herokuapp.com/',
        }
    },
    data: {
        url: 'https://cors-anywhere.herokuapp.com/'
    },
    fetch: function fetch(app, identity, data, done) {
        var _ = this,
            url = (identity.proxy.url || '').length ? identity.proxy.url : _.data.url,
            x = new XMLHttpRequest();

        x.open('GET', url + data.url);

        x.onload = x.onerror = function() {
            if (x.status === 200) {
                done(undefined, x.responseText);
            } else {
                done(x.responseText);
            }
        };

        x.send();
    }
},
// {
//     id: 'aws-lambda',
//     name: 'Custom AWS Lambda',
//     description: 'A simple AWS Lambda passthrough server. The defaults point to FollowAlong, but don\'t trust us! Deploy your own: server/aws-lambda.',
//     fields: {
//         accessKeyId: {
//             type: 'input',
//             label: 'Access Key ID',
//             required: true
//         },
//         secretAccessKey: {
//             type: 'input',
//             label: 'Secret Access Key',
//             required: true
//         },
//         region: {
//             type: 'input',
//             label: 'Region',
//             required: true
//         },
//         functionName: {
//             type: 'input',
//             label: 'Function Name',
//             required: true
//         }
//     },
//     fetch: function fetch(app, identity, data, done) {
//         var _ = this;

//         app.cachedLoadExternal(AWS_CONFIG.sdk, function() {
//             var functionName = (identity.proxy.functionName || '').length ? identity.proxy.functionName : _.fields.functionName.default,
//                 region = (identity.proxy.region || '').length ? identity.proxy.region : _.fields.region.default;

//             window.AWS.config.update({
//                 accessKeyId: (identity.proxy.accessKeyId || '').length ? identity.proxy.accessKeyId : _.fields.accessKeyId.default,
//                 secretAccessKey: (identity.proxy.secretAccessKey || '').length ? identity.proxy.secretAccessKey : _.fields.secretAccessKey.default,
//                 region: region
//             });

//             new window.AWS.Lambda({
//                 region: region,
//                 apiVersion: '2015-03-31'
//             }).invoke({
//                 FunctionName: functionName,
//                 InvocationType: 'RequestResponse',
//                 LogType: 'None',
//                 Payload: JSON.stringify({
//                     url: data.url
//                 })
//             }, function(err, data) {
//                 try {
//                     done(undefined, JSON.parse(data.Payload));
//                 } catch (e) {
//                     done(err);
//                 }
//             });
//         });
//     }
// }
];
