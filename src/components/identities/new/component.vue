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
        @click="startFresh()"
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
import { reactive } from 'vue'
import { Base64 } from 'js-base64'
import seed from '@/components/app/seed'
import utils from '@/components/app/utils'

export default {
  props: ['app'],
  data () {
    return {
      tab: 'fresh',
      paste: ''
    }
  },
  methods: {
    startFresh () {
      var _ = this
      var newIdentity = seed[0]

      delete newIdentity.id

      utils.setIdentityDefaults(newIdentity)

      _.app.setIdentity(newIdentity)
      _.app.identities.push(newIdentity)

      _.$router.push('/')
    },

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
      var _ = this
      var paste = _.paste.trim()

      if (utils.isBase64(paste)) {
        try {
          paste = Base64.decode(paste)
        } catch (e) { }
      }

      try {
        var feed, newIdentity, existingIdentity, existingFeed, key, i

        newIdentity = reactive(JSON.parse(paste))

        _.paste = ''

        if (!newIdentity.id) throw new Error('No ID provided.')

        existingIdentity = _.app.identities.find(function (i) {
          return i.id === newIdentity.id
        })

        if (existingIdentity) {
          for (key in newIdentity) {
            if (key === 'feeds' || key === 'items') continue
            existingIdentity[key] = newIdentity[key]
          }
        } else {
          existingIdentity = utils.mappers.IDENTITY_REMOTE(newIdentity)
          existingIdentity._decrypted = true
          _.app.identities.push(existingIdentity)
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
            existingIdentity.feeds.push(feed)
          }
        }

        _.app.setIdentity(existingIdentity, true)
        _.$router.push('/')
      } catch (e) {
        // console.log(e);
        alert('Invalid Configuration.')
      }
    }
  }
}
</script>
