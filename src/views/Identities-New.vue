<template>
    <div class="feeds">
        <h1>New Identity</h1>

        <div class="field">
            <label>How would you like to add your identity?</label>
            <select v-model="tab">
                <option value="fresh">Start Fresh</option>
                <option value="upload">Upload File</option>
                <option value="paste">Copy and Paste</option>
            </select>
        </div>

        <div class="field" v-if="tab === 'paste'">
            <label for="paste">Paste your identity config:</label>
            <textarea id="paste" v-model="paste"></textarea>
        </div>

        <div class="field" v-if="tab === 'upload'">
            <label for="upload">Upload your identity config:</label>
            <input type="file" id="upload" ref="upload" v-on:change="upload" />
        </div>

        <div class="field">
            <button v-if="tab === 'fresh'" v-on:click="startFresh()">
                Start a Fresh Identity
            </button>
            <button v-else v-on:click="importConfig(tab)">
                Import My Configuration
            </button>
        </div>
    </div>
</template>

<script>
import { Base64 }   from 'js-base64';
import seed from '@/components/app/seed';

export default {
    name: 'subscriptions',
    props: ['app'],
    data() {
        return {
            tab: 'fresh',
            paste: ''
        };
    },
    methods: {
        startFresh() {
            var _ = this,
                newIdentity = seed[0];

            delete newIdentity.id;

            _.app.setIdentityDefaults(newIdentity);
            _.app.setIdentity(newIdentity);
            _.app.identities.push(newIdentity);

            _.$router.push('/');
        },

        upload() {
            var _ = this,
                files = _.$refs.upload.files;

            if (!files || !files[0]) {
                return alert('Invalid File.');
            }

            var reader = new FileReader();

            reader.onload = function() {
                _.paste = reader.result;
            };

            reader.readAsText(files[0]);
        },

        importConfig(type) {
            var _ = this;

            try {
                var paste = Base64.decode(_.paste);
                _.paste = paste;
            } catch (e) { }

            try {
                var feed, newIdentity, existingIdentity, existingFeed, key, i;

                newIdentity = JSON.parse(_.paste);

                if (!newIdentity.id) throw new Error('No ID provided.');

                existingIdentity = _.app.identities.find(function(i) {
                    return i.id === newIdentity.id;
                });

                if (existingIdentity) {
                    for (key in newIdentity) {
                        if (key === 'feeds' || key === 'items') continue;
                        existingIdentity[key] = newIdentity[key];
                    }
                } else {
                    existingIdentity = _.app.toRemote(newIdentity);
                    existingIdentity._decrypted = true;
                    _.app.identities.push(existingIdentity);
                }

                for (i = newIdentity.feeds.length - 1; i >= 0; i--) {
                    feed = newIdentity.feeds[i];

                    if (!feed.url) continue;

                    existingFeed = existingIdentity.feeds.find(function(f) {
                        return f.url === feed.url;
                    });

                    if (existingFeed) {
                        for (key in feed) {
                            existingFeed[key] = feed[key];
                        }
                    } else {
                        existingIdentity.feeds.push(feed);
                    }
                }

                _.app.setIdentity(existingIdentity, true);
                _.$router.push('/');
            } catch (e) {
                // console.log(e);
                alert('Invalid Configuration.');
            }
        }
    }
};
</script>
