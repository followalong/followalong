<template>
  <div class="feeds">
    <div class="title-wrapper">
      <h1>New Identity</h1>
    </div>

    <div class="field">
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
    </div>

    <div
      v-if="tab === 'paste'"
      class="field"
    >
      <label for="paste">Paste your identity config:</label>
      <textarea
        id="paste"
        v-model="paste"
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
        @click="importConfig(tab)"
      >
        Import My Configuration
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['app'],
  data () {
    return {
      tab: 'fresh',
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

    async importConfig (type) {
      var _ = this
      var paste = _.paste.trim()

      if (utils.isBase64(paste)) {
        try {
          paste = Base64.decode(paste)
        } catch (e) { }
      }

      try {
        var feed, newIdentity, existingIdentity, existingFeed, key, i

        newIdentity = JSON.parse(paste)

        _.paste = ''

        if (!newIdentity.id) throw new Error('No ID provided.')

        existingIdentity = _.app.models.identity.inMemory.find(newIdentity.id)

        if (existingIdentity) {
          for (key in newIdentity) {
            if (key === 'feeds' || key === 'items') continue
            existingIdentity[key] = newIdentity[key]
          }
        } else {
          existingIdentity._decrypted = true
          existingIdentity = _.app.addIdentity(_.app, existingIdentity)
        }

        for (i = newIdentity.feeds.length - 1; i >= 0; i--) {
          feed = newIdentity.feeds[i]

          if (!feed.url) continue

          existingFeed = existingIdentity.feeds.find(function (f) {
            return f.url === feed.url
          })

          if (existingFeed) {
            for (key in feed) {
              existingFeed[key] = feed[key]
            }
          } else {
            existingIdentity.addFeed(feed)
          }
        }

        await _.app.setIdentity(_.app, existingIdentity, true)

        _.$router.push('/')
      } catch (e) {
        // console.log(e);
        alert('Invalid Configuration.')
      }
    }
  }
}
</script>
