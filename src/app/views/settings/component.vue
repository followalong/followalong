<template>
  <div class="settings">
    <div v-if="app.identity">
      <div class="title-wrapper">
        <h1>Settings</h1>
      </div>

      <div class="field">
        <p>
          Thanks for using FollowAlong.
          <span class="highlight">Your data stays only on <em>this device</em>, optionally encrypted and backed up to a service of your choice.</span>
        </p>
      </div>
      <div class="field">
        <label for="name">Identity Name</label>
        <input
          id="name"
          v-model="app.identity.name"
          type="text"
          placeholder="Your Name"
          aria-label="Identity name"
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
            @blur="app.identity.services.local.maxReadCount < 1 ? app.identity.services.local.maxReadCount = 1 : 1; app.identity.save()"
          >
        </div>

        <label for="secretStrategy">
          Data Encryption
        </label>

        <span class="hint">
          There is no perfect strategy: it depends how you use FollowAlong, how much you trust your device, care about convenience, or if you use multiple devices. Flip through the options to see more details.
        </span>

        <select
          id="secretStrategy"
          v-model="strategy"
          aria-label="Select data encryption strategy"
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
          aria-label="Reset secret key"
          @click="changeEncryption(app, app.keychain, app.store, app.identity, 'ask', revert())"
        >
          Reset Secret Key
        </a>

        <div v-if="app.identity.services.local.strategy === 'store'">
          <label for="secretKey">
            Secret Key
          </label>
          <input
            id="secretKey"
            v-model="app.keychain.keys[app.identity.id]"
            type="password"
            @blur="app.saveKey(app.keychain, app.store, app.identity, app.keychain.keys[app.identity.id])"
          >
          <span
            v-if="!app.keychain.keys[app.identity.id] || !app.keychain.keys[app.identity.id].length"
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
              aria-label="Download identity"
              @click="app.commands.downloadIdentity(app.identity)"
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
              aria-label="Copy configuration"
              @click="app.commands.copyConfig(app.identity)"
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
              aria-label="Forget identity"
              @click="reset(app.identity)"
            >
              Forget This Identity
            </button>
          </div>
          <div class="half-column">
            <p>
              Remote: <strong>{{ app.queries.remoteSize(app.identity) }}</strong><br>
              Local: <strong>{{ app.queries.localSize(app.identity) }}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['app'],
  data () {
    return {
      secretKey: undefined,
      strategy: undefined,
      hasStorageSupport: window.indexedDB
    }
  },
  computed: {
  },
  mounted () {
    this.strategy = this.app.queries.serviceForIdentity(this.app.identity, 'local').strategy
  },
  methods: {
    revert () {
      return () => {
        this.strategy = this.app.identity.services.local.strategy
      }
    },

    reset (identity) {
      if (confirm('Are you sure you want to forget this identity?')) {
        this.app.commands.removeIdentity(identity)
        this.app.commands.reload()
      }
    }
  }
}
</script>
