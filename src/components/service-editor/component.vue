<template>
  <div v-if="app.identity.services" class="field">
    <div v-if="!services.length">
      <ul>
        <li>
          <p>Coming soon!</p>
        </li>
      </ul>
    </div>

    <div v-else class="services">
      <label for="proxy">
        <span v-if="!service">Choose A </span>Service
      </label>

      <div v-if="service">
        <ul>
          <li class="single">
            <div class="select-service custom-service">
              <a href="javascript:;" v-on:click="reset()" class="reset">
                &times;
              </a>

              <h3>
                {{service.data ? (service.data.name || service.name) : service.name}}
              </h3>

              <p v-html="service.description"></p>

              <div v-if="service.fields" class="form">
                <div v-if="!service.pricing || service.data.token || showPaidSubscription">
                  <div class="field" v-for="(field, key) in service.fields" :key="key">
                    <label :for="'field_' + service.id + '_' + serverTypeKey + '_' + key">{{field.label}}</label>
                    <input v-model="service.data[key]" v-on:blur="app.save()" :type="field.type" :disabled="field.disabled" :id="'field_' + service.id + '_' + serverTypeKey + '_' + key" :name="key">
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
                <a href="javascript:;" v-if="service.pricing" v-on:click="subscriptionModalService = service">
                  <span v-if="service.data.token">Re-</span>Subscribe
                </a>

                <a href="javascript:;" v-if="service.pricing && !service.data.token" v-on:click="showPaidSubscription = !showPaidSubscription">
                  Credentials
                </a>

                <a href="javascript:;" v-on:click="app.copyService(service)">
                  <font-awesome-icon icon="copy" />
                  Copy
                </a>

                <a href="javascript:;" v-on:click="app.downloadService(service)">
                  <font-awesome-icon icon="download" />
                  Download
                </a>

                <a href="javascript:;" v-on:click="app.removeService(app.identity, service)">
                  Delete
                </a>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <ul v-else>
        <li v-for="s in customServices" :key="s.id">
          <a href="javascript:;" v-on:click="selectService(s)" class="select-service custom-service">
            <h3>
              {{s.data.name}}
            </h3>
            <p v-html="s.description"></p>
          </a>
        </li>

        <li v-for="s in services" :key="s.id">
          <a href="javascript:;" v-on:click="selectService(s)" class="select-service">
            <h3>
              {{s.name}}
              <span v-if="s.pricing" class="hint inline">(paid)</span>
            </h3>
            <p v-html="s.description"></p>
          </a>
        </li>

        <li>
          <a href="javascript:;" class="select-service">
            <h3>Custom Service</h3>
            <p>Paste or upload a service configuration.</p>

            <div v-if="tab">
              <br>

              <div class="field">
                <textarea v-if="tab === 'paste'" id="paste" v-model="paste"></textarea>
                <input v-if="tab === 'upload'" type="file" id="upload" ref="upload" v-on:change="upload" />
              </div>

              <div class="field">
                  <button v-on:click="importService()" class="button-small">
                      Import My Configuration
                  </button>

                  &nbsp;

                  <button v-on:click="tab = ''" class="button-small button-gray">
                      Cancel
                  </button>
              </div>
            </div>

            <div v-else>
              <br>
              <button v-on:click="tab = 'paste'" class="button-xsmall button-gray button-invert">
                Paste
              </button>

              &nbsp; OR &nbsp;

              <button v-on:click="tab = 'upload'" class="button-xsmall button-gray button-invert">
                Upload
              </button>
            </div>
          </a>
        </li>
      </ul>
    </div>

    <div v-if="subscriptionModalService" class="subscription-modal modal">
      <div class="overlay" v-on:click="subscriptionModalService = undefined"></div>

      <div class="content">
        <a href="javascript:;" v-on:click="subscriptionModalService = undefined" class="close">
          &times;
        </a>

        <h3>{{subscriptionModalService.name}}</h3>

        <p v-if="subscriptionModalService.description" v-html="subscriptionModalService.description"></p>

        <CreditCard :handler="this" :submit="subscribeToService">
          <p class="notice">
            <span v-if="errorMessage" class="red" v-html="errorMessage"></span>
            <span v-else>This is a one-time payment; it does NOT renew automatically.</span>
          </p>

          <button type="submit" :disabled="loading" class="button-large full-width">
            <span v-if="loading">Loading...</span>
            <span v-else>
              <span v-if="subscriptionModalService && subscriptionModalService.data.token">Re-</span>Subscribe Now
              (${{subscriptionModalService.pricing.stripe.price}} USD)
            </span>
          </button>
        </CreditCard>
      </div>
    </div>
  </div>
</template>

<script>
import Vue        from 'vue';
import { Base64 } from 'js-base64';
import SERVICES   from '@/components/app/services';
import CreditCard from '@/components/credit-card/component.vue';

export default {
  name: 'ServiceEditor',
  props: ['app', 'serverType', 'serverTypeKey'],

  components: {
    CreditCard
  },

  data() {
    return {
      paste: '',
      errorMessage: undefined,
      loading: false,
      tab: undefined,
      showPaidSubscription: false,
      subscriptionModalService: undefined
    };
  },

  computed: {
    services() {
      var _ = this;

      return SERVICES.filter(function(service) {
        return service.supports.indexOf(_.serverTypeKey) !== -1;
      });
    },

    customServices() {
      var _ = this;
      return _.app.identity.services.custom;
    },

    service() {
      var _ = this;
      return _.app.findService(_.app.identity, _.serverTypeKey);
    },
  },

  methods: {
    selectService(s, override) {
      var _ = this;

      if (override || (!s.template && s.fields)) {
        s = JSON.parse(JSON.stringify(s));
        s.template = s.template || s.id;
        s.id = _.app.generateId();
        s.data.name = s.data.name || (s.name + ' (Custom)');

        _.app.identity.services.custom.push(s);
      }

      _.showPaidSubscription = false;

      Vue.set(_.app.identity.services, _.serverTypeKey, { symlink: s.id });

      if (s.pricing && !s.data.token) {
        _.subscriptionModalService = s;
      }

      _.app.save();
    },

    importService() {
      var _ = this,
          paste = _.paste.trim();

      if (_.app.isBase64(paste)) {
          try {
              paste = Base64.decode(paste);
          } catch (e) { }
      }

      _.selectService(JSON.parse(paste), true);

      _.paste = '';
    },

    upload() {
        var _ = this,
            files = _.$refs.upload.files;

        if (!files || !files[0]) {
            return alert('Invalid File.');
        }

        var reader = new FileReader();

        reader.onload = function() {
            _.paste = reader.result;
        };

        reader.readAsText(files[0]);
    },

    reset() {
      var _ = this;
      Vue.delete(_.app.identity.services, _.serverTypeKey);
    },

    subscribeToService(response) {
      var _ = this,
          service = _.subscriptionModalService,
          supports = (service.supports || '').split(/,\s?/);

      _.subscriptionModalService = undefined;
      _.showPaidSubscription = true;

      service.data.token = response.token;
      service.data.expiry = response.expiry;

      for (var i = supports.length - 1; i >= 0; i--) {
        Vue.set(_.app.identity.services, supports[i], { symlink: service.id });
      }

      _.loading = false;
      _.app.save();
    },

    error(msg) {
      var _ = this;

      _.errorMessage = msg;
      _.loading = false;
    }
  }
};
</script>
