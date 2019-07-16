<template>
  <div class="services">
    <div v-if="service">
      <ul>
        <li class="single">
          <div class="select-service">
            <a href="javascript:;" v-on:click="reset()" class="reset">
              <font-awesome-icon icon="sync" />
              Swap
            </a>
            <h3>{{service.name}}</h3>
            <p v-html="service.description"></p>
          </div>
        </li>
      </ul>
    </div>

    <div v-else>
      <ul>
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
