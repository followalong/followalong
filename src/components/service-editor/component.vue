<template>
  <div
    v-if="app.identity.services"
    class="field"
  >
    <div v-if="!services.length">
      <ul>
        <li>
          <p>Coming soon!</p>
        </li>
      </ul>
    </div>

    <div
      v-else
      class="services"
    >
      <div v-if="service">
        <ul>
          <li class="single">
            <div class="select-service custom-service">
              <a
                href="javascript:;"
                class="reset"
                @click="reset()"
              >
                &times;
              </a>

              <h3>
                {{ service.data ? (service.data.name || service.name) : service.name }}
              </h3>

              <p v-html="service.description" />

              <div
                v-if="service.fields"
                class="form"
              >
                <div v-if="!service.pricing || service.data.token || showPaidSubscription">
                  <div
                    v-for="(field, key) in service.fields"
                    :key="key"
                    class="field"
                  >
                    <label :for="'field_' + service.id + '_' + serverTypeKey + '_' + key">{{ field.label }}</label>
                    <input
                      :id="'field_' + service.id + '_' + serverTypeKey + '_' + key"
                      v-model="service.data[key]"
                      :type="field.type"
                      :disabled="field.disabled"
                      :name="key"
                      @blur="app.save()"
                    >
                  </div>
                </div>

                <div v-else>
                  <p class="notice red">
                    <strong>This is a paid service and you have not yet subscribed.</strong><br>
                    Click "Subscribe" to start using this service.<br>
                    Click "Credentials" if you already have credentials.
                  </p>
                </div>
              </div>

              <div class="post-meta">
                <a
                  v-if="service.pricing"
                  href="javascript:;"
                  @click="subscriptionModalService = service"
                >
                  <span v-if="service.data.token">Re-</span>Subscribe
                </a>

                <a
                  v-if="service.pricing && !service.data.token"
                  href="javascript:;"
                  @click="showPaidSubscription = !showPaidSubscription"
                >
                  Credentials
                </a>

                <a
                  href="javascript:;"
                  @click="copyService(service)"
                >
                  <font-awesome-icon icon="copy" />
                  Copy
                </a>

                <a
                  href="javascript:;"
                  @click="downloadService(service)"
                >
                  <font-awesome-icon icon="download" />
                  Download
                </a>

                <a
                  href="javascript:;"
                  @click="removeService(app.identity, service)"
                >
                  Delete
                </a>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <ul v-else>
        <li
          v-for="s in customServices"
          :key="s.id"
        >
          <a
            href="javascript:;"
            class="select-service custom-service"
            @click="selectService(s)"
          >
            <h3>
              {{ s.data.name }}
            </h3>
            <p v-html="s.description" />
          </a>
        </li>

        <li
          v-for="s in services"
          :key="s.id"
        >
          <a
            href="javascript:;"
            class="select-service"
            @click="selectService(s)"
          >
            <h3>
              {{ s.name }}
              <span
                v-if="s.pricing"
                class="hint inline"
              >(paid)</span>
            </h3>
            <p v-html="s.description" />
          </a>
        </li>

        <li>
          <a
            href="javascript:;"
            class="select-service"
          >
            <h3>Custom Service</h3>
            <p>Paste or upload a service configuration.</p>

            <div v-if="tab">
              <br>

              <div class="field">
                <textarea
                  v-if="tab === 'paste'"
                  id="paste"
                  v-model="paste"
                />
                <input
                  v-if="tab === 'upload'"
                  id="upload"
                  ref="upload"
                  type="file"
                  @change="upload"
                >
              </div>

              <div class="field">
                <button
                  class="button-small"
                  @click="importService()"
                >
                  Import My Configuration
                </button>

                  &nbsp;

                <button
                  class="button-small button-gray"
                  @click="tab = ''"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div v-else>
              <br>
              <button
                class="button-xsmall button-gray button-invert"
                @click="tab = 'paste'"
              >
                Paste
              </button>

              &nbsp; OR &nbsp;

              <button
                class="button-xsmall button-gray button-invert"
                @click="tab = 'upload'"
              >
                Upload
              </button>
            </div>
          </a>
        </li>
      </ul>
    </div>

    <div
      v-if="subscriptionModalService"
      class="subscription-modal modal"
    >
      <div
        class="overlay"
        @click="subscriptionModalService = undefined"
      />

      <div class="content-wrapper">
        <div class="content">
          <a
            href="javascript:;"
            class="close"
            @click="subscriptionModalService = undefined"
          >
            &times;
          </a>

          <h3>{{ subscriptionModalService.name }}</h3>

          <p
            v-if="subscriptionModalService.description"
            v-html="subscriptionModalService.description"
          />

          <CreditCard
            :handler="this"
            :submit="subscribeToService"
          >
            <p class="notice">
              <span
                v-if="errorMessage"
                class="red"
                v-html="errorMessage"
              />
              <span v-else>This is a one-time payment; it does NOT renew automatically.</span>
            </p>

            <button
              type="submit"
              :disabled="loading"
              class="button-large full-width"
            >
              <span v-if="loading">Loading...</span>
              <span v-else>
                <span v-if="subscriptionModalService && subscriptionModalService.data.token">Re-</span>Subscribe Now
                (${{ subscriptionModalService.pricing.stripe.price }} USD)
              </span>
            </button>
          </CreditCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Base64 } from 'js-base64'
import { saveAs } from 'file-saver'
import copy from 'copy-to-clipboard'
import SERVICES from '@/components/app/services'
import utils from '@/components/app/utils'
import CreditCard from '@/components/credit-card/component.vue'

export default {

  components: {
    CreditCard
  },
  props: ['app', 'serverType', 'serverTypeKey'],

  data () {
    return {
      paste: '',
      errorMessage: undefined,
      loading: false,
      tab: undefined,
      showPaidSubscription: false,
      subscriptionModalService: undefined
    }
  },

  computed: {
    services () {
      var _ = this

      return SERVICES.filter(function (service) {
        return service.supports.indexOf(_.serverTypeKey) !== -1
      })
    },

    customServices () {
      var _ = this
      return _.app.identity.services.custom
    },

    service () {
      var _ = this
      return _.app.findService(_.app.identity, _.serverTypeKey)
    }
  },

  methods: {
    selectService (s, override) {
      var _ = this

      if (override || (!s.template && s.fields)) {
        s = JSON.parse(JSON.stringify(s))
        s.template = s.template || s.id
        s.id = utils.generateId()
        s.data.name = s.data.name || (s.name + ' (Custom)')

        _.app.identity.services.custom.push(s)
      }

      _.showPaidSubscription = false

      _.app.identity.services[_.serverTypeKey] = { symlink: s.id }

      if (s.pricing && !s.data.token) {
        _.subscriptionModalService = s
      }

      _.app.save()
    },

    importService () {
      var _ = this
      var paste = _.paste.trim()

      if (utils.isBase64(paste)) {
        try {
          paste = Base64.decode(paste)
        } catch (e) { }
      }

      _.selectService(JSON.parse(paste), true)

      _.paste = ''
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

    reset () {
      var _ = this

      delete _.app.identity.services[_.serverTypeKey]
    },

    subscribeToService (response) {
      var _ = this
      var service = _.subscriptionModalService
      var supports = (service.supports || '').split(/,\s?/)

      _.subscriptionModalService = undefined
      _.showPaidSubscription = true

      service.data.token = response.token
      service.data.expiry = response.expiry

      for (var i = supports.length - 1; i >= 0; i--) {
        _.app.identity.services[supports[i]] = { symlink: service.id }
      }

      _.loading = false
      _.app.save()
    },

    error (msg) {
      var _ = this

      _.errorMessage = msg
      _.loading = false
    },

    copyService (service) {
      service = JSON.parse(JSON.stringify({
        id: service.id,
        template: service.template,
        data: service.data
      }))

      service.template = service.template || service.id

      copy(Base64.encode(JSON.stringify(service)))

      alert('Copied service to clipboard.')
    },

    removeService (identity, service) {
      var arr = identity.services.custom

      if (confirm('Are you sure you want to remove this service?')) {
        arr.splice(arr.indexOf(service), 1)
      }

      this.app.save()
    },

    downloadService (service) {
      service = JSON.parse(JSON.stringify({
        id: service.id,
        template: service.template,
        data: service.data
      }))

      service.template = service.template || service.id

      var filename = window.location.host.replace(':', '.') + '.' + service.id + '.json'
      var str = JSON.stringify(service)
      var blob = new Blob([str], { type: 'application/json;charset=utf-8' })

      saveAs(blob, filename)
    }
  }
}
</script>
