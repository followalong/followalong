var AWS_CONFIG = {
    sdk: '/js/aws-sdk-2.444.0.min.js',
    region: 'us-east-1',
    accessKeyId: atob('QUtJQVZCVlI1Sk02U002TDVUTEU='),
    secretAccessKey: atob('SFFOQ2RWdVQ3VXc5UUJvU0habTFSd01hdFB5Qm5oTm5iMDdwZXJsVA')
};

var SERVICES = [{
    id: 'followalong-free',
    name: 'FollowAlong Free',
    description: 'We\'re offering this as a public service. Your requests may be throttled. We don\'t record or track any data. Don\'t trust us with your traffic? Good! Use our <a href="https://github.com/followalong/followalong" target="_blank" class="link" onclick="event.stopImmediatePropagation();">template</a> to create your own in minutes!',
    supports: 'rss',
    data: {
        accessKeyId: AWS_CONFIG.accessKeyId,
        secretAccessKey: AWS_CONFIG.secretAccessKey,
        region: AWS_CONFIG.region,
        functionName: 'followalong-passthrough'
    },
    request: function request(app, identity, data, done) {
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
                Payload: JSON.stringify(data)
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
//     supports: 'rss,sync,publish,search,media',
//     data: {
//         accessKeyId: AWS_CONFIG.accessKeyId,
//         secretAccessKey: AWS_CONFIG.secretAccessKey,
//         region: AWS_CONFIG.region,
//         functionName: 'followalong-passthrough'
//     },
//     request: function request(app, identity, data, done) {
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
//                 Payload: JSON.stringify(data)
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
    id: 'aws-lambda',
    name: 'AWS Lambda',
    description: 'Use our source code <a href="https://github.com/followalong/followalong" target="_blank" class="link" onclick="event.stopImmediatePropagation();">here</a> to quickly deploy your own passthrough server to Amazon\'s Lambda.',
    supports: 'rss,sync',
    fields: {
        name: {
            type: 'text',
            label: 'Service Name',
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
        region: 'us-east-1'
    },
    request: function request(app, identity, data, done) {
        var _ = this;

        app.cachedLoadExternal(AWS_CONFIG.sdk, function() {
            var functionName = (_.data.functionName || '').length ? _.data.functionName : _.fields.functionName.default,
                region = (_.data.region || '').length ? _.data.region : _.fields.region.default;

            window.AWS.config.update({
                accessKeyId: (_.data.accessKeyId || '').length ? _.data.accessKeyId : _.fields.accessKeyId.default,
                secretAccessKey: (_.data.secretAccessKey || '').length ? _.data.secretAccessKey : _.fields.secretAccessKey.default,
                region: region
            });

            new window.AWS.Lambda({
                region: region,
                apiVersion: '2015-03-31'
            }).invoke({
                FunctionName: functionName,
                InvocationType: 'RequestResponse',
                LogType: 'None',
                Payload: JSON.stringify(data)
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
            placeholder: 'https://cors-anywhere.herokuapp.com/',
        }
    },
    data: {
        url: 'https://cors-anywhere.herokuapp.com/'
    },
    request: function request(app, identity, data, done) {
        var _ = this,
            url = (_.data.url || '').length ? _.data.url : _.data.url,
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
{
    id: 'followalong-none',
    name: 'None',
    description: 'No proxy will be used.',
    supports: 'rss,sync',
    request: function request(app, identity, data, done) {
        if (!data.url) return done('No URL supplied.');

        var x = new XMLHttpRequest();

        x.open('GET', data.url);

        x.onload = x.onerror = function() {
            if (x.status === 200) {
                done(undefined, x.responseText);
            } else {
                done(x.responseText);
            }
        };

        x.send();
    }
}
];

export default SERVICES;
