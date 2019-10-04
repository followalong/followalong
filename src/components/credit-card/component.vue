<template>
  <form v-on:submit.prevent="purchase" :disabled="handler.loading">
    <div class="field">
      <div ref="card" class="align-center">Loading...</div>
    </div>

    <slot></slot>
  </form>
</template>

<style type="text/css">
/**
 * The CSS shown here will not be introduced in the Quickstart guide, but shows
 * how you can use CSS to style your Element's container.
 */
.StripeElement {
  box-sizing: border-box;

  height: 40px;

  padding: 10px 12px;

  border: 1px solid transparent;
  border-radius: 4px;
  background-color: white;

  box-shadow: 0 1px 3px 0 #e6ebf1;
  -webkit-transition: box-shadow 150ms ease;
  transition: box-shadow 150ms ease;
}

.StripeElement--focus {
  box-shadow: 0 1px 3px 0 #cfd7df;
}

.StripeElement--invalid {
  border-color: #fa755a;
}

.StripeElement--webkit-autofill {
  background-color: #fefde5 !important;
}
</style>

<script>
import loadExternal from 'load-external';
import SERVICES     from '@/components/app/services';

var srcCache = {},
    stripe, elements, card;

function cachedLoadExternal(url, done) {
  if (srcCache[url]) {
    return done();
  }

  srcCache[url] = true;
  loadExternal(url, done);
}

export default {
  name: 'credit-card',
  props: ['submit', 'handler'],
  mounted() {
    var _ = this;

    cachedLoadExternal('https://js.stripe.com/v3/', function() {
        // stripe = stripe || window.Stripe('pk_test_ovSgIfRBzeqGwOYQl6P39IR300ktMwyAXW');
        stripe = stripe || window.Stripe(atob('cGtfbGl2ZV9GZDZwUUtwMWkwMUtnVlE1aFFhWTlBOG0wMEU3ak43Y2hK'));
        elements = elements || stripe.elements();
        card = card || elements.create('card', {
          style: {
            base: {
              color: '#32325d',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSmoothing: 'antialiased',
              fontSize: '16px',
              '::placeholder': {
                color: '#aab7c4'
              }
            },
            invalid: {
              color: '#fa755a',
              iconColor: '#fa755a'
            }
          }
        });

        card.addEventListener('change', function(event) {
          if (event.error) {
            _.handler.error(event.error.message);
          } else {
            _.handler.error(undefined);
          }
        });

        card.mount(_.$refs.card);
    });
  },
  methods: {
    purchase() {
      var _= this;

      _.handler.error(undefined);
      _.handler.loading = true;

      stripe.createToken(card).then(function(result) {
        if (result.error) {
          _.handler.error(result.error.message);
        } else {
          SERVICES[0].request({}, {}, {
            action: 'subscribe',
            token: result.token.id
          }, function(err, response) {
            if (err) {
              _.handler.error(err.message);
            } else if (response.body) {
              if (response.status === 200) {
                _.submit(response.body);
              } else {
                _.handler.error(response.body);
              }
            } else {
              console.error(response);
              _.handler.error('Something went wrong.');
            }
          });
        }
      }).catch(function(err) {
        _.handler.error(err.message);
      });
    }
  }
};
</script>
