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
      <!-- <p
        v-if="!hasStorageSupport"
        class="highlight"
      >
        This browser does not support any storage options.
        You can still use FollowAlong, but your data will be gone when you leave the page.
      </p> -->

      <div
        class="field"
      >
        <!-- <div class="field">
          <label for="max-read-count">Maximum Number of "Read" Items to Keep</label>
          <span class="hint">Unread and Saved items are always kept.</span>
          <input
            id="max-read-count"
            v-model="localService.maxReadCount"
            type="number"
            min="1"
            placeholder="100"
            @blur="localService.maxReadCount < 1 ? localService.maxReadCount = 1 : 1; app.identity.save()"
          >
        </div> -->

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
          v-if="app.queries.hasChangeablePassword(localService)"
          href="javascript:;"
          class="hint"
          aria-label="Change password"
          @click="app.commands.changeLocalEncryptionStrategy(app.identity, encryptionStrategy)"
        >
          Reset Secret Key
        </a>
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
              Local: <strong>{{ localSize }}</strong>
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
      secretKey: '',
      encryptionStrategy: '',
      localSize: '0 kb',
      hasStorageSupport: window.indexedDB
    }
  },
  computed: {
    localService () {
      this.app.identity.services = this.app.identity.services || {}
      this.app.identity.services.local = this.app.identity.services.local || {}

      return this.app.identity.services.local
    }
  },
  watch: {
    'localService.encryptionStrategy' () {
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
      this.encryptionStrategy = this.localService.encryptionStrategy
    },
    changeEncryption ($event) {
      $event.stopImmediatePropagation()

      return this.app.commands.changeLocalEncryptionStrategy(this.app.identity, $event.target.value)
        .catch(() => this.init())
    }
  }
}
</script>
