<template>
  <div class="settings">
    <div v-if="app.identity" class="narrow-container">
      <div class="title-wrapper">
        <h1>Setup</h1>
      </div>

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
            <!-- <div class="field">
              <label for="dark" class="checkbox-label">
                <input type="checkbox" id="dark" v-model="app.identity.dark" value="dark" v-on:change="app.save()">
                Dark Mode
              </label>
            </div> -->
            <p v-if="!hasStorageSupport" class="highlight">
              This browser does not support any storage options.
              You can still use FollowAlong, but your data will be gone when you leave the page.
            </p>
          </v-tab>

          <v-tab title="Services">
            <div class="field">
              <p>
                External services are not <em>required</em>, but they <em>can</em> improve load times, search results, cache images, allow for syncing and publishing, and much more.
              </p>
              <!-- <p class="hint hint-after">
                The source code for the FollowAlong service can be found <a href="https://github.com/followalong/followalong/tree/master/server/aws-lambda-passthrough" target="_blank">here</a>.
              </p> -->
            </div>

            <div class="field">
              <vue-tabs>
                <v-tab v-for="(serverType, key) in serverTypes" :key="key" :title="serverType.shortName">
                  <div class="field">
                    <h3>{{serverType.name}}</h3>
                    <p v-html="serverType.description"></p>
                  </div>

                  <ServiceEditor :app="app" :serverType="serverType" :serverTypeKey="key" />
                </v-tab>
              </vue-tabs>
            </div>
          </v-tab>

          <v-tab title="Data">
            <div class="field" v-if="app.identity.services">
              <div class="field">
                <label for="max-read-count">Maximum Number of "Read" Items to Keep</label>
                <span class="hint">Unread and Saved items are always kept.</span>
                <input type="number" id="max-read-count" min="1" v-model="app.identity.services.local.maxReadCount" v-on:blur="app.identity.services.local.maxReadCount < 1 ? app.identity.services.local.maxReadCount = 1 : 1; app.save()" placeholder="100">
              </div>

              <label for="secretStrategy">
                Local Data Encryption
              </label>

              <span class="hint">
                There is no perfect strategy: it depends how you use FollowAlong, how much you trust your device, care about convenience, or if you use multiple devices. Flip through the options to see more details.
              </span>

              <select id="secretStrategy" v-model="app.identity.services.local.strategy" v-on:change="app.saveKey(app.identity, secretKey)">
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

                  <button v-if="app.identity.services.local.strategy === 'ask'" v-on:click="app.getAskSecretKey(app.identity, true)" class="button-gray">Reset Secret Key</button>
                </span>
              </div>

              <div v-if="app.identity.services.local.strategy === 'store'">
                <label for="secretKey">
                  Secret Key
                </label>
                <input type="password" id="secretKey" v-model="app.keychain[app.identity.id]" v-on:blur="app.saveKey(app.identity, app.keychain[app.identity.id])">
                <span class="notice red" v-if="!app.keychain[app.identity.id] || !app.keychain[app.identity.id].length">Your local data is NOT encrypted because you have not supplied a secret key!</span>
              </div>
            </div>

            <div class="field">
              <div class="columns">
                <div class="half-column">
                  <label>Download My Data</label>
                  <span class="hint">
                    Download a full copy of your data.
                  </span>
                  <button v-on:click="app.downloadIdentity(app.identity)" class="button-gray">Download Identity</button>
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
      </vue-tabs>
    </div>
  </div>
</template>

<script>
import {VueTabs, VTab} from 'vue-nav-tabs';
import ServiceEditor from '@/components/service-editor/component.vue';

var SERVER_TYPES = {
  rss: {
    shortName: 'RSS',
    name: 'RSS Proxy',
    description: 'On the internet, there is a technical issue known as CORS, which blocks us from accessing some RSS feeds directly. You may use a proxy to get around the CORS issue, as well as bypassing geographically-restricted content.'
  },
  sync: {
    shortName: 'Sync',
    name: 'Subscription Syncing & Storage',
    description: 'Store and sync your subscriptions and saved items across multiple devices.'
  },
  publish: {
    shortName: 'Publish',
    name: 'Feed Publishing',
    description: 'Publish your own RSS feed.',
  },
  search: {
    shortName: 'Search',
    name: 'Search Proxy',
    description: 'Provide a smarter, faster search.',
  },
  media: {
    shortName: 'Media',
    name: 'Media Proxy',
    description: 'Avoid hotlinking or keep your media stored long-term.',
  },
  // ads: {
  //   shortName: 'ads',
  //   name: 'Ads Proxy',
  //   description: 'Opt-in to receive ads which compensate the feeds you follow.',
  // }
};

export default {
  name: 'settings',
  props: ['app'],
  components: {
    VueTabs,
    VTab,
    ServiceEditor
  },
  data() {
    return {
      secretKey: undefined,
      hasStorageSupport: this.app.store.INDEXEDDB || this.app.store.LOCALSTORAGE,
      selectedServerType: SERVER_TYPES.rss,
      serverTypes: SERVER_TYPES
    };
  },
  // watch: {
  //   'app.identity.services.local.strategy' (val) {
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

      switch (_.app.identity.services.local.strategy) {
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

      switch (_.app.identity.services.local.strategy) {
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

      switch (_.app.identity.services.local.strategy) {
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

      switch (_.app.identity.services.local.strategy) {
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

      switch (_.app.identity.services.local.strategy) {
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

      switch (_.app.identity.services.local.strategy) {
        case 'none':
          return 'Your local data will not be encrypted.';
        case 'rotate':
          return 'A new secret key is generated every time your data is saved locally. It is all managed for you – without having to enter a secret key. If you trust this computer and browser, this is a great choice.';
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
