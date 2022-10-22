<template>
  <div class="feeds">
    <div class="title-wrapper">
      <h1>New Identity</h1>
    </div>

    <!-- <div class="field">
      <label>How would you like to add your identity?</label>
      <select v-model="tab">
        <option value="fresh">
          Start Fresh
        </option>
        <option value="upload">
          Upload File
        </option>
        <option value="paste">
          Copy and Paste
        </option>
      </select>
    </div> -->

    <form
      aria-label="Create identity from configuration"
      @submit.prevent="importConfig"
    >
      <div
        v-if="tab === 'paste'"
        class="field"
      >
        <label for="paste">Paste your identity config:</label>
        <textarea
          id="paste"
          v-model="paste"
          aria-label="Paste configuration"
        />
      </div>

      <div
        v-if="tab === 'upload'"
        class="field"
      >
        <label for="upload">Upload your identity config:</label>
        <input
          id="upload"
          ref="upload"
          type="file"
          @change="upload"
        >
      </div>

      <div class="field">
        <button
          v-if="tab === 'fresh'"
          @click="app.addExampleIdentity(app, true)"
        >
          Start a Fresh Identity
        </button>
        <button
          v-else
        >
          Import My Configuration
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  props: ['app'],
  data () {
    return {
      tab: 'paste',
      paste: ''
    }
  },
  methods: {
    upload () {
      var _ = this
      var files = _.$refs.upload.files

      if (!files || !files[0]) {
        return alert('Invalid File.')
      }

      var reader = new FileReader()

      reader.onload = function () {
        _.paste = reader.result
      }

      reader.readAsText(files[0])
    },

    importConfig (type) {
      this.app.commands.importConfiguration(this.paste)
        .then((identity) => {
          this.app.setIdentity(identity)

          this.$router.push('/')
        }).catch((e) => {
          console.error(e)
          alert(e.message)
        })
    }
  }
}
</script>
