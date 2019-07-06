<template>
    <div class="feeds">
        <h1>New Identity</h1>

        <div class="field">
            <label>How would you like to add your identity?</label>
            <select v-model="tab">
                <option value="paste">Copy and Paste</option>
                <option value="upload" disabled>Upload File – Coming Soon!</option>
            </select>
        </div>

        <div class="field" v-if="tab ===  'paste'">
            <label for="paste">Paste your identity config:</label>
            <textarea id="paste" v-model="paste"></textarea>
        </div>

        <div class="field" v-if="tab === 'upload'">
            <label for="upload">Upload your identity config:</label>
            <input type="file" id="upload" ref="upload" v-on:change="previewFiles"  />
        </div>

        <div class="field">
            <button v-on:click="importConfig(tab)">Import My Configuration</button> &nbsp;
            <button class="button-gray" v-on:click="startFresh()">Start a Fresh Identity</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'subscriptions',
    props: ['app'],
    data() {
        return {
            tab: 'paste',
            paste: ''
        };
    },
    methods: {
        previewFiles() {
            // console.log(this.$refs.upload.files[0]);
            this.files = this.$refs.upload.files
        },

        startFresh() {
            var _ = this,
                newIdentity = {
                    name: 'Fresh',
                    _decrypted: true
                };

            _.app.setIdentityDefaults(newIdentity);
            _.app.setIdentity(newIdentity);
            _.app.identities.push(newIdentity);
            _.$router.push('/');
        },

        importConfig(type) {
            var _ = this;

            if (type === 'paste') {
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
                        existingIdentity = {
                            name: newIdentity.name,
                            proxy: newIdentity.proxy,
                            local: newIdentity.local,
                            remote: newIdentity.remote,
                            items: newIdentity.items,
                            feeds: newIdentity.feeds,
                            _decrypted: true
                        };

                        _.app.identities.push(existingIdentity);
                    }


                    for (i = newIdentity.feeds.length - 1; i >= 0; i--) {
                        feed = newIdentity.feeds[i];

                        if (!feed.id) continue;

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

                    _.app.setIdentity(existingIdentity);
                    _.$router.push('/');
                } catch (e) {
                    // console.log(e);
                    alert('Invalid Configuration.');
                }
            }
        }
    }
};
</script>
