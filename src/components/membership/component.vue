<template>
  <div v-if="membership.feed" class="subscription-modal modal">
    <div class="overlay" v-on:click="app.editMembership()"></div>

    <div class="content form">
      <a href="javascript:;" v-on:click="app.editMembership()" class="close">
        &times;
      </a>

      <h3>{{membership.feed.name}}: {{title}}</h3>

      <div v-if="membership.intent === 'register'">
        <CreditCard :handler="this">
          <div class="field">
            <label>Username / Email Address</label>
            <input type="email" placeholder="you@email.com">
          </div>

          <div class="field">
            <label>Password</label>
            <input type="password">
          </div>

          <div class="field">
            <button type="submit" class="button-large full-width">
              Subscribe ($23 USD)
            </button>
          </div>
        </CreditCard>
      </div>

      <div v-if="membership.intent === 'login'">
        <div class="field">
          <label>Username / Email Address</label>
          <input type="email" placeholder="you@email.com">
        </div>

        <div class="field">
          <label>Password</label>
          <input type="password">
        </div>

        <div class="field">
          <button type="submit" class="button-large full-width">
            Log In as Member
          </button>
        </div>
      </div>

      <div v-if="membership.intent === 'renew'">
        <CreditCard :handler="this">
          <div class="field">
            <button type="submit" class="button-large full-width">
              Re-Subscribe ($23 USD)
            </button>
          </div>
        </CreditCard>
      </div>

      <div v-if="membership.intent === 'support'">
        <div class="field">
          <label>Email Address</label>
          <input type="email" placeholder="you@email.com">
        </div>

        <div class="field">
          <label>What's on your mind?</label>
          <textarea></textarea>
        </div>

        <div class="field">
          <button type="submit" class="button-large full-width">
            Send Message
          </button>
        </div>
      </div>

      <div v-if="membership.intent === 'password'">
        <div class="field">
          <label>Password</label>
          <input type="password">
        </div>

        <div class="field">
          <label>Confirm Password</label>
          <input type="password">
        </div>

        <div class="field">
          <button type="submit" class="button-large full-width">
            Change Password
          </button>
        </div>
      </div>

      <div v-if="membership.intent === 'logout'">
        <div class="field">
          <button type="submit" class="button-large full-width">
            Log Out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CreditCard from '@/components/credit-card/component.vue';

var INTENT_TITLES = {
      register: 'Become a Member',
      login: 'Login as Member',
      renew: 'Renew Membership',
      support: 'Member Support',
      password: 'Change Member Password',
      logout: 'Logout as Member',
  };

export default {
  name: 'Membership',
  props: ['app', 'membership'],
  components: {
    CreditCard
  },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    title() {
      return this.membership ? INTENT_TITLES[this.membership.intent] : 'Loading...';
    }
  }
};
</script>
