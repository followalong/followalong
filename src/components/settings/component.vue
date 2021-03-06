<template>
  <div class="settings">
    <div
      v-if="app.identity"
      class="narrow-container"
    >
      <div class="title-wrapper">
        <h1>Setup</h1>
      </div>

      <div class="field">
        <p>
          Thanks for using FollowAlong. Once you start using it, you'll realize how magical it is.
          <span class="highlight">And your data stays safe with <em>you</em>.</span>
        </p>
      </div>
      <div class="field">
        <label for="name">Identity Nickname</label>
        <input
          id="name"
          v-model="app.identity.name"
          type="text"
          placeholder="Your Name"
          @blur="app.save()"
        >
      </div>
      <p
        v-if="!hasStorageSupport"
        class="highlight"
      >
        This browser does not support any storage options.
        You can still use FollowAlong, but your data will be gone when you leave the page.
      </p>

      <div
        v-if="app.identity.services"
        class="field"
      >
        <div class="field">
          <label for="max-read-count">Maximum Number of "Read" Items to Keep</label>
          <span class="hint">Unread and Saved items are always kept.</span>
          <input
            id="max-read-count"
            v-model="app.identity.services.local.maxReadCount"
            type="number"
            min="1"
            placeholder="100"
            @blur="app.identity.services.local.maxReadCount < 1 ? app.identity.services.local.maxReadCount = 1 : 1; app.save()"
          >
        </div>

        <label for="secretStrategy">
          Local Data Encryption
        </label>

        <span class="hint">
          There is no perfect strategy: it depends how you use FollowAlong, how much you trust your device, care about convenience, or if you use multiple devices. Flip through the options to see more details.
        </span>

        <select
          id="secretStrategy"
          v-model="app.identity.services.local.strategy"
          @change="app.saveKey(app.identity, secretKey)"
        >
          <option value="ask">
            Ask Every Page Load (best, most secure, slightly annoying)
          </option>
          <option value="rotate">
            Rotate Keys (recommended if using one device and you trust it)
          </option>
          <option value="store">
            Store Key Locally (recommended if you trust your device)
          </option>
          <option value="none">
            Unencrypted (for testing or development)
          </option>
        </select>

        <a
          v-if="app.identity.services.local.strategy === 'ask'"
          href="javascript:;"
          class="hint"
          @click="app.getAskSecretKey(app.identity, true)"
        >
          Reset Secret Key
        </a>

        <div v-if="app.identity.services.local.strategy === 'store'">
          <label for="secretKey">
            Secret Key
          </label>
          <input
            id="secretKey"
            v-model="app.keychain[app.identity.id]"
            type="password"
            @blur="app.saveKey(app.identity, app.keychain[app.identity.id])"
          >
          <span
            v-if="!app.keychain[app.identity.id] || !app.keychain[app.identity.id].length"
            class="notice red"
          >Your local data is NOT encrypted because you have not supplied a secret key!</span>
        </div>
      </div>

      <div class="field">
        <div class="columns">
          <div class="half-column">
            <label>Download My Data</label>
            <span class="hint">
              Download a full copy of your data.
            </span>
            <button
              class="button-gray"
              @click="downloadIdentity(app.identity)"
            >
              Download Identity
            </button>
          </div>

          <div class="half-column">
            <label>Copy My Configuration</label>
            <span class="hint">
              Copy your identity to your clipboard.
            </span>
            <button
              class="button-gray"
              @click="copyConfig(app.identity)"
            >
              Copy Configuration
            </button>
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
            <button
              class="button-red"
              @click="reset(app.identity)"
            >
              Forget This Identity
            </button>
          </div>
          <div class="half-column">
            <p>
              Remote: <strong>{{ profileSize(app.identity, 'Remote') }}</strong><br>
              Local: <strong>{{ profileSize(app.identity, 'Local') }}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Base64 } from 'js-base64'
import copy from 'copy-to-clipboard'
import { saveAs } from 'file-saver'
import utils from '@/components/app/utils'

export default {
  props: ['app'],
  data () {
    return {
      secretKey: undefined,
      hasStorageSupport: this.app.store.INDEXEDDB || this.app.store.LOCALSTORAGE
    }
  },
  methods: {
    copyConfig (identity) {
      copy(Base64.encode(JSON.stringify(utils.mappers.IDENTITY_REMOTE(identity))))
      alert('Copied configuration to clipboard.')
    },

    profileSize (identity, type) {
      if (!identity || !identity.items) return 'N/A'

      let unit = 'b'
      let size = JSON.stringify(this.app['to' + type](identity)).length

      if (size > 1000000) {
        size = size / 1000000
        unit = 'mb'
      } else if (size > 1000) {
        size = size / 1000
        unit = 'kb'
      }

      return '~' + (Math.round(size * 10) / 10) + ' ' + unit
    },

    downloadIdentity (identity) {
      const filename = window.location.host.replace(':', '.') + '.' + identity.id + '.json'
      const str = JSON.stringify(utils.mappers.IDENTITY_REMOTE(identity))
      const blob = new Blob([str], { type: 'application/json;charset=utf-8' })

      saveAs(blob, filename)
    },

    reset (identity) {
      if (confirm('Are you sure you want to forget this identity?')) {
        this.app.store.removeItem(identity.id, () => {
          this.app.store.removeItem('key-' + identity.id, () => {
            window.location.href = '/'
          })
        })
      }
    }
  }
}
</script>
