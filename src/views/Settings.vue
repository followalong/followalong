<template>
  <div class="settings">
    <div v-if="app.identity" class="narrow-container">
      <h1>Setup</h1>

      <vue-tabs>
          <v-tab title="General">
            <div class="field">
              <p>
                Thanks for using FollowAlong. Once you start using it, you'll realize how magical it is.
                <span class="highlight">And your data stays safe with <em>you</em>.</span>
              </p>
            </div>
            <div class="field">
              <label for="name">Identity Nickname</label>
              <input type="text" id="name" v-model="app.identity.name" v-on:blur="app.save()" placeholder="Your Name">
            </div>
          </v-tab>

          <v-tab title="Servers">
            <div class="field">
              <p>FollowAlong doesn't require <em>any</em> external services or servers, but they <em>can</em> be bolted on to boost your experience. There are 5 different connection points where you can plug in:</p>
            </div>

            <div class="field">
              <label>Choose a connection point:</label>
              <select v-model="selectedServer">
                <option v-for="(server, key) in servers" :key="key" :value="server">
                  {{server.name}}
                </option>
              </select>
              <p class="hint hint-after" v-html="selectedServer.description"></p>
            </div>

            <div class="field" v-if="app.identity.proxy">
              <label for="proxy">
                Passthrough Proxy
              </label>
              <span class="hint">Bypass CORS and geographic restrictions.</span>
              <select v-model="app.identity.proxy.strategy" v-on:blur="app.save()">
                <option v-for="proxy in app.proxies" :key="proxy.strategy" :value="proxy.strategy">
                  {{proxy.name}}
                </option>
              </select>

              <span class="hint hint-after" v-html="selectedProxy.description"></span>
            </div>

            <div v-for="(field, key) in selectedProxy.fields" :key="key" class="field">
              <label :for="key">
                {{selectedProxy.name}} Proxy &mdash; {{field.label}}
              </label>
              <input type="text" :id="key" v-model="app.identity.proxy[key]" v-on:blur="app.save()" :placeholder="field.placeholder" :required="field.required || false">
            </div>
          </v-tab>

          <v-tab title="Local">
            <p v-if="!hasStorageSupport" class="highlight">
              This browser does not support any storage options.
              You can still use FollowAlong, but your data will be gone when you leave the page.
            </p>

            <div class="field">
              <label for="max-read-count">Maximum Number of "Read" Items to Keep</label>
              <span class="hint">Unread and Saved items are always kept.</span>
              <input type="number" id="max-read-count" min="1" v-model="app.identity.maxReadCount" v-on:blur="app.identity.maxReadCount < 1 ? app.identity.maxReadCount = 1 : 1; app.save()" placeholder="100">
            </div>

            <div class="field" v-if="app.identity.local">
              <label for="secretStrategy">
                Storage Strategy
              </label>

              <span class="hint">
                There is no perfect strategy: it depends how you use FollowAlong, how much you trust your device, care about convenience, or if you use multiple devices. Flip through the options to see more details.
              </span>

              <select id="secretStrategy" v-model="app.identity.local.strategy" v-on:change="app.saveKey(app.identity, secretKey)">
                <option value="ask">Ask Every Page Load (best, most secure, slightly annoying)</option>
                <option value="rotate">Rotate Keys (recommended if using one device and you trust it)</option>
                <option value="store">Store Key Locally (recommended if you trust your device)</option>
                <option value="none">Unencrypted (for testing or development)</option>
              </select>

              <div class="secret-info">
                <span class="explanation">{{description}}</span>
                <span class="red">Drawback: <strong>{{drawback}}</strong></span>
                <span class="star-wrapper">
                  <table>
                    <tr>
                      <td>
                        Client Security:
                      </td>
                      <td>
                        <span class="stars" v-html="clientSecurity"></span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Network Security:
                      </td>
                      <td>
                        <span class="stars" v-html="networkSecurity"></span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Server Security:
                      </td>
                      <td>
                        <span class="stars" v-html="serverSecurity"></span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Speed to Save:
                      </td>
                      <td>
                        <span class="stars" v-html="speed"></span>
                      </td>
                    </tr>
                  </table>

                  <button v-if="app.identity.local.strategy === 'ask'" v-on:click="app.getAskSecretKey(app.identity, true)" class="button-gray">Reset Secret Key</button>
                </span>
              </div>

              <div v-if="app.identity.local.strategy === 'store'">
                <label for="secretKey">
                  Secret Key
                </label>
                <input type="password" id="secretKey" v-model="app.keychain[app.identity.id]" v-on:blur="app.saveKey(app.identity, app.keychain[app.identity.id])">
                <span class="notice red" v-if="!app.keychain[app.identity.id] || !app.keychain[app.identity.id].length">Your data is NOT encrypted because you have not supplied a secret key!</span>
              </div>
            </div>
          </v-tab>
          <v-tab title="Identity">
            <div class="field">
              <div class="columns">
                <div class="half-column">
                  <label>Download My Data</label>
                  <span class="hint">
                    Download a full copy of your data.
                  </span>
                  <button v-on:click="app.download(app.identity)" class="button-gray">Download Identity</button>
                </div>

                <div class="half-column">
                  <label>Copy My Configuration</label>
                  <span class="hint">
                    Copy your identity to your clipboard.
                  </span>
                  <button v-on:click="app.copyConfig(app.identity)" class="button-gray">Copy Configuration</button>
                </div>
              </div>
            </div>

            <div class="field">
              <div class="columns">
                <div class="half-column">
                  <label>Forget My Data</label>
                  <span class="hint">
                    Wipe your data from this browser.
                  </span>
                  <button v-on:click="app.reset(app.identity)" class="button-red">Forget This Identity</button>
                </div>
                <div class="half-column">
                  <p>
                    Remote: <strong>{{app.profileSize(app.identity, 'Remote')}}</strong><br>
                    Local: <strong>{{app.profileSize(app.identity, 'Local')}}</strong>
                  </p>
                </div>
              </div>
            </div>
          </v-tab>
          <v-tab title="Help">
            <div class="field">
              <p>
                Need some help?
                Email <a href="mailto:followalong@protonmail.com" target="_blank" class="link">followalong@protonmail.com</a>.
                We respond to mail once a day.
              </p>
            </div>
          </v-tab>
      </vue-tabs>
    </div>
  </div>
</template>

<script>
import {VueTabs, VTab} from 'vue-nav-tabs';

var SERVERS = {
  rss: {
    name: 'RSS Proxy',
    description: 'On the internet, there is a technical issue known as CORS, which blocks us from accessing popular RSS feeds directly. Because of this, we do provide a "passthrough" as a default. Don\'t trust us with your traffic? Good! Use our templates to create your own in minutes!'
  },
  read: {
    name: 'Read Storage',
    description: 'Store and sync your subscriptions and saved items.'
  },
  write: {
    name: 'Write Storage',
    description: 'Store and publish your own RSS feed.'
  },
  search: {
    name: 'Search Proxy',
    description: 'Provide a smarter, faster search.'
  },
  media: {
    name: 'Media Proxy',
    description: 'Avoid hotlinking or keep your media stored long-term.'
  }
};

export default {
  name: 'settings',
  props: ['app'],
  components: {
    VueTabs,
    VTab
  },
  data() {
    return {
      secretKey: undefined,
      hasStorageSupport: this.app.store.INDEXEDDB || this.app.store.LOCALSTORAGE,
      selectedServer: SERVERS.rss,
      servers: SERVERS
    };
  },
  // watch: {
  //   'app.identity.local.strategy' (val) {
  //     if (val === 'ask') {
  //       delete this.app.keychain[this.app.identity.id];
  //     }
  //   }
  // },
  computed: {
    clientSecurity() {
      var _ = this,
          star = '&#9733;',
          stars = star;

      switch (_.app.identity.local.strategy) {
        case 'ask':
          stars += ' ' + star;
          stars += ' ' + star;
          stars += ' ' + star;
          stars += ' ' + star;
          break;
      }

      return stars;
    },
    networkSecurity() {
      var _ = this,
          star = '&#9733;',
          stars = star;

      switch (_.app.identity.local.strategy) {
        case 'rotate':
          stars += ' ' + star;
        case 'ask':
        case 'store':
          stars += ' ' + star;
          stars += ' ' + star;
          stars += ' ' + star;
          break;
      }

      return stars;
    },
    serverSecurity() {
      var _ = this,
          star = '&#9733;',
          stars = star;

      switch (_.app.identity.local.strategy) {
        case 'rotate':
          stars += ' ' + star;
        case 'ask':
        case 'store':
          stars += ' ' + star;
          stars += ' ' + star;
          stars += ' ' + star;
          break;
      }

      return stars;
    },
    speed() {
      var _ = this,
          star = '&#9733;',
          stars = star;

      switch (_.app.identity.local.strategy) {
        case 'none':
          stars += ' ' + star;
          stars += ' ' + star;
          stars += ' ' + star;
        case 'rotate':
        case 'ask':
        case 'store':
          stars += ' ' + star;
          break;
      }

      return stars;
    },
    drawback() {
      var _ = this;

      switch (_.app.identity.local.strategy) {
        case 'none':
          return 'No Security!';
        case 'rotate':
          return 'No syncing between devices.';
        case 'ask':
          return 'You must enter your secret key every time you visit. One local key unlocks all data.';
        case 'store':
          return 'Your secret key is stored locally in plain text. One local key unlocks all data.';
      }

      return undefined;
    },
    description() {
      var _ = this;

      switch (_.app.identity.local.strategy) {
        case 'none':
          return 'Your data will not be encrypted.';
        case 'rotate':
          return 'A new secret key is generated every time your data is saved. It is all managed for you – without having to enter a secret key. If you trust this computer and browser, this is a great choice.';
        case 'ask':
          return 'Every time you visit, you\'ll have to enter your secret key. This is as secure as the device you\'re using and the most secure option if you use multiple devices.';
        case 'store':
          return 'Your secret key is stored in this browser and remembered between visits. If you trust this computer and browser, this is a great choice.';
      }

      return undefined;
    },
    selectedProxy() {
      var _ = this;

      if (!_.app.identity || !_.app.identity.proxy) return {};

      var proxy = _.app.proxies.find(function(p) {
        return p.strategy === _.app.identity.proxy.strategy;
      }) || _.app.proxies[0];

      _.app.setProxyDefaults(_.app.identity.proxy);

      return proxy;
    }
  }
};
</script>
