<template>
  <div v-if="app.identity.services" class="field">
    <label for="proxy">
      <span v-if="!service">Choose A </span>Service
    </label>

    <div class="services">
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
            <label :for="'field_' + key">{{field.label}}</label>
            <input v-model="service.data[key]" v-on:blur="app.save()" :type="field.type" :id="'field_' + key" :name="key">
          </div>
        </form>
      </div>

      <div v-else>
        <ul>
          <li v-for="s in app.identity.services.custom" :key="s.id">
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
      return SERVICES;
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
