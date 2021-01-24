<template>
  <div v-if="membership">
    <a
      v-if="isMemberable(membership.feed)"
      href="javascript:;"
      :class="membershipClass(feed) + ' quick-subscribe'"
      title="Membership"
      @click="editMembership(feed, 'register')"
    >
      <font-awesome-icon
        icon="id-card-alt"
        class="i"
      />
    </a>

    <div
      v-if="membership.feed"
      class="modal"
    >
      <div
        class="overlay"
        @click="editMembership()"
      />

      <div class="content-wrapper">
        <div class="content form">
          <a
            href="javascript:;"
            class="close"
            @click="editMembership()"
          >
            &times;
          </a>

          <h3>{{ membership.feed.name }}: {{ title }}</h3>

          <div v-if="membership.intent === 'register'">
            <h4><strong>${{ pricing.stripe.price }} {{ pricing.stripe.currency }}</strong> for a <strong>One-Year Membership</strong></h4>

            <div :class="'secure-note ' + membershipClass(feed) + '-background'">
              <font-awesome-icon icon="lock" />

              <p v-if="isMemberExpiring(feed)">
                Your membership is expiring.
              </p>

              <p v-if="isMemberExpired(feed)">
                Your membership has expired.
              </p>

              <p v-if="isMember(feed) && !isMemberExpiring(feed) && !isMemberExpired(feed)">
                Your membership is still active, but feel free to renew to show your support to <em>{{ membership.feed.name }}</em>.
              </p>

              <p v-if="!isMember(feed)">
                <!-- This is a direct, one-time payment. from you to {{membership.feed.name}}.
                While FollowAlong is happy to provide a convenient service for creators to be compensated, this This is a direct interaction with {{membership.feed.name}}. -->
                <!-- Because this is a direct-connection, one-time payment to {{membership.feed.name}}, all requests (refund, customer service) must be sent to {{membership.feed.name}}. -->
                This is a secure, one-time transaction directly with <a
                  target="_blank"
                  :href="(membership.feed.help || {website:'www.fifa.com'}).website"
                >{{ (membership.feed.help || {website:'www.fifa.com'}).website }}</a>.
                As such, all customer-service requests should be forwarded to "{{ membership.feed.name }}" (<a
                  target="_blank"
                  :href="(membership.feed.help || {website:'www.fifa.com'}).website"
                >{{ (membership.feed.help || {website:'www.fifa.com'}).website }}</a> or <a
                  target="_blank"
                  :href="'mailto:' + (membership.feed.help || { email: 'bob@email.com' }).email"
                >{{ (membership.feed.help || { email: 'bob@email.com' }).email }}</a>).
              </p>
            </div>

            <CreditCard :handler="this">
              <div class="field">
                <label>Username / Email Address</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                >
              </div>

              <div class="field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="* * * * * * * *"
                >
              </div>

              <div class="field">
                <button
                  type="submit"
                  class="button-large full-width"
                >
                  Subscribe (${{ pricing.stripe.price }} {{ pricing.stripe.currency }})
                </button>
              </div>

              <div class="field">
                <p class="hint align-center">
                  Already a member?
                  <a
                    href="javascript:;"
                    @click="membership.intent = 'login'"
                  >Log in.</a>
                </p>
              </div>
            </CreditCard>
          </div>

          <div v-if="membership.intent === 'login'">
            <div class="field">
              <label>Username / Email Address</label>
              <input
                type="email"
                placeholder="you@email.com"
              >
            </div>

            <div class="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="* * * * * * * *"
              >
            </div>

            <div class="field">
              <button
                type="submit"
                class="button-large full-width"
              >
                Log In as Member
              </button>
            </div>

            <div class="field">
              <p class="hint align-center">
                Not a member?
                <a
                  href="javascript:;"
                  @click="membership.intent = 'register'"
                >Become a Member.</a>
              </p>
            </div>
          </div>

          <div v-if="membership.intent === 'renew'">
            <CreditCard :handler="this">
              <div class="field">
                <button
                  type="submit"
                  class="button-large full-width"
                >
                  Re-Subscribe ($23 USD)
                </button>
              </div>
            </CreditCard>
          </div>

          <div v-if="membership.intent === 'support'">
            <div class="field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@email.com"
              >
            </div>

            <div class="field">
              <label>What's on your mind?</label>
              <textarea />
            </div>

            <div class="field">
              <button
                type="submit"
                class="button-large full-width"
              >
                Send Message
              </button>
            </div>
          </div>

          <div v-if="membership.intent === 'password'">
            <div class="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="* * * * * * * *"
              >
            </div>

            <div class="field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="* * * * * * * *"
              >
            </div>

            <div class="field">
              <button
                type="submit"
                class="button-large full-width"
              >
                Change Password
              </button>
            </div>
          </div>

          <div v-if="membership.intent === 'logout'">
            <div class="field">
              <button
                type="submit"
                class="button-large full-width"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CreditCard from '@/components/credit-card/component.vue'

var INTENT_TITLES = {
  register: 'New Membership',
  login: 'Login as Member',
  renew: 'Renew Membership',
  support: 'Member Support',
  password: 'Change Member Password',
  logout: 'Logout as Member'
}

export default {
  name: 'Membership',
  components: {
    CreditCard
  },
  props: ['app'],
  data () {
    return {
      loading: false,
      membership: undefined
    }
  },
  computed: {
    title () {
      return this.membership ? INTENT_TITLES[this.membership.intent] : 'Loading...'
    },

    pricing () {
      return this.membership.feed.pricing || {
        stripe: {
          publishableKey: 'asdf',
          price: 29,
          currency: 'USD',
          method: 'stripe'
        },
        bitcoin: {
          price: 0.0001,
          currency: 'USD',
          method: 'bitcoin'
        }
      }
    }
  },
  methods: {
    membershipClass (feed) {
      if (this.isMemberExpired(feed)) return 'is-expired'
      if (this.isMemberExpiring(feed)) return 'is-expiring'
      if (this.isMember(feed)) return 'is-member'

      return 'is-nonmember'
    },

    isMemberable (feed) {
      return false
    },

    isMember (feed) {
      return false
    },

    isMemberExpiring (feed) {
      return false // feed.membership && feed.membership.expireAt & feed.membership.expireAt < new Date();
    },

    isMemberExpired (feed) {
      return false// feed.membership && feed.membership.expireAt & feed.membership.expireAt < new Date();
    },

    isHelpable (feed) {
      return this.isMemberable(feed)
    },

    editMembership (feed, intent) {
      if (feed) {
        this.membership = {
          feed,
          intent: intent || 'login'
        }
      } else {
        this.membership = undefined
      }
    }
  }
}
</script>
