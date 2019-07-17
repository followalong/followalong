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
            <div class="select-service">
              <a href="javascript:;" v-on:click="reset()" class="reset">
                <font-awesome-icon icon="sync" />
                Change
              </a>
              <h3>{{service.data ? (service.data.name || service.name) : service.name}}</h3>
              <p v-html="service.description"></p>
            </div>
          </li>
        </ul>

        <form>
          <div class="field" v-for="(field, key) in service.fields" :key="key">
            <label :for="'field_' + service.id + '_' + serverTypeKey + '_' + key">{{field.label}}</label>
            <input v-model="service.data[key]" v-on:blur="app.save()" :type="field.type" :id="'field_' + service.id + '_' + serverTypeKey + '_' + key" :name="key">
          </div>
        </form>
      </div>

      <ul v-else>
        <li v-for="s in customServices" :key="s.id">
          <a href="javascript:;" v-on:click="app.removeService(app.identity, s)" class="reset">
            &times;
          </a>
          <a href="javascript:;" v-on:click="select(s)" class="select-service">
            <h3>{{s.data.name}}</h3>
            <p v-html="s.description"></p>
          </a>
        </li>

        <li v-for="s in services" :key="s.id">
          <a href="javascript:;" v-on:click="select(s)" class="select-service">
            <h3>{{s.name}}</h3>
            <p v-html="s.description"></p>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import SERVICES from '@/components/app/services';

export default {
  name: 'ServiceEditor',
  props: ['app', 'serverType', 'serverTypeKey'],

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
    select(s) {
      var _ = this;

      if (!s.template && s.fields) {
        s = JSON.parse(JSON.stringify(s));
        s.template = s.id;
        s.id = _.app.generateId();
        s.data.name = s.name + ' (Custom)';

        _.app.identity.services.custom.push(s);
      }

      Vue.set(_.app.identity.services, _.serverTypeKey, { symlink: s.id });

      _.app.save();
    },

    reset() {
      var _ = this;
      Vue.delete(_.app.identity.services, _.serverTypeKey);
    }
  }
};
</script>
