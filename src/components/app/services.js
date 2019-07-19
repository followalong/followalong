import AWS from 'aws-sdk';

var STRIP_SLASHES = /^\/|\/$/g;

function lambdaPassthrough(app, identity, data, done) {
    var _ = this;

    new AWS.Lambda({
        endpoint: new AWS.Endpoint(_.data.endpoint),
        accessKeyId: _.data.accessKeyId,
        secretAccessKey: _.data.secretAccessKey,
        region: _.data.region,
        apiVersion: 'latest'
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
}

function s3Sync(app, identity, data, done) {
    var _ = this,
        key = _.data.path.replace(STRIP_SLASHES, '') + '/' + 'FILENAME',
        s3 = new AWS.S3({
            endpoint: new AWS.Endpoint(_.data.endpoint),
            accessKeyId: _.data.accessKeyId,
            secretAccessKey: _.data.secretAccessKey,
            apiVersion: 'latest'
        });

    s3.getObject({
        Bucket: _.data.bucket,
        Key: key,
    }, function(err, oldData) {
        try {
            app.mergeData(identity, JSON.parse(oldData.Body.toString()));
        } catch (e) { 1; }

        s3.putObject({
            Body: JSON.stringify(data.identity),
            Bucket: _.data.bucket,
            Key: key,
        }, function(err) {
            app.saveLocal(function() {
                done(err, err ? undefined : data.identity);
            });
        });
    });
}

var AWS_CONFIG = {
    endpoint: 'lambda.us-east-1.amazonaws.com',
    region: 'us-east-1',
    accessKeyId: atob('QUtJQVZCVlI1Sk02U002TDVUTEU='),
    secretAccessKey: atob('SFFOQ2RWdVQ3VXc5UUJvU0habTFSd01hdFB5Qm5oTm5iMDdwZXJsVA')
};

var SERVICES = [
{
    id: 'followalong-free',
    name: 'FollowAlong Free',
    description: 'We\'re offering this as a public service. Your requests may be throttled. We don\'t record or track any data. Don\'t trust us with your traffic? Good! Use our <a href="https://github.com/followalong/followalong" target="_blank" class="link" onclick="event.stopImmediatePropagation();">template</a> to create your own in minutes!',
    supports: 'rss',
    data: {
        endpoint: AWS_CONFIG.endpoint,
        accessKeyId: AWS_CONFIG.accessKeyId,
        secretAccessKey: AWS_CONFIG.secretAccessKey,
        region: AWS_CONFIG.region,
        functionName: 'followalong-passthrough'
    },
    request: lambdaPassthrough
},
{
    id: 's3',
    name: 'S3',
    description: 'Store data directly to an S3-compatible server.',
    // supports: 'sync',
    supports: '',
    data: {
        endpoint: 's3.amazonaws.com',
        path: '/identities/',
        accessKeyId: AWS_CONFIG.accessKeyId,
        secretAccessKey: AWS_CONFIG.secretAccessKey,
        functionName: 'followalong-passthrough'
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
        path: {
            type: 'text',
            label: 'Base Path',
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
//     id: 'followalong-unlimited',
//     name: 'FollowAlong Premium',
//     description: 'Unlimited access with no throttling, logging, or tracking.',
//     supports: 'rss,sync',
//     fields: {
//         name: {
//             type: 'text',
//             label: 'Service Name',
//             required: true
//         },
//         url: {
//             type: 'text',
//             label: 'Secret Access Key',
//             required: true
//         }
//     },
//     data: {
//         endpoint: AWS_CONFIG.endpoint,
//         accessKeyId: AWS_CONFIG.accessKeyId,
//         secretAccessKey: AWS_CONFIG.secretAccessKey,
//         region: AWS_CONFIG.region,
//         functionName: 'followalong-passthrough'
//     },
//     request: lambdaPassthrough
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
    request: lambdaPassthrough
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
    supports: 'rss',
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
