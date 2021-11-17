<template>
  <div class="settings">
    <div v-if="app.identity">
      <div class="title-wrapper">
        <h1>Settings</h1>
      </div>

      <div class="field">
        <p>
          Thanks for using FollowAlong.
          <span class="highlight">Your data stays only on <em>this device</em>, optionally encrypted and backed up to an addon of your choice.</span>
        </p>
      </div>

      <div class="addon">
        <h2>Your Profile</h2>
        <p />
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
          class="field"
        >
          <label for="secretStrategy">
            Local Data Encryption
          </label>

          <select
            id="secretStrategy"
            v-model="encryptionStrategy"
            aria-label="Encryption strategy"
            @change="changeEncryption"
          >
            <option value="ask">
              Enter the key upon every visit (best, most secure, slightly annoying)
            </option>
            <option value="store">
              Store the key on this device (recommended if you trust your device)
            </option>
            <option value="none">
              Unencrypted (for testing or development)
            </option>
          </select>

          <a
            v-if="app.queries.hasChangeablePassword(localAddon)"
            href="javascript:;"
            class="hint"
            aria-label="Change password"
            @click="app.commands.changeLocalEncryptionStrategy(app.identity, encryptionStrategy)"
          >
            Reset Secret Key
          </a>
        </div>
      </div>

      <div class="addon">
        <h2>Your Data</h2>
        <p />
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
                Remote: <strong>{{ remoteSize }}</strong><br>
                Local: <strong>{{ localSize }}</strong>
              </p>
            </div>
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
      secretKey: '',
      encryptionStrategy: '',
      localSize: '0 kb',
      remoteSize: '0 kb',
      hasStorageSupport: this.app.queries.hasStorageSupport()
    }
  },
  computed: {
    localAddon () {
      return this.app.queries.addonForIdentity(this.app.identity, 'local')
    }
  },
  watch: {
    'localAddon.data.encryptionStrategy' () {
      this.init()
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    reset (identity) {
      if (confirm('Are you sure you want to forget this identity?')) {
        this.app.commands.removeIdentity(identity)
          .then(() => this.app.commands.reload())
      }
    },
    init () {
      this.app.queries.localSize(this.app.identity).then((localSize) => {
        this.localSize = localSize
      })

      this.app.queries.remoteSize(this.app.identity).then((remoteSize) => {
        this.remoteSize = remoteSize
      })

      this.encryptionStrategy = this.localAddon.data.encryptionStrategy
    },
    changeEncryption ($event) {
      $event.stopImmediatePropagation()

      return this.app.commands.changeLocalEncryptionStrategy(this.app.identity, $event.target.value)
        .catch(() => this.init())
    }
  }
}
</script>
