<template>
  <form
    :disabled="handler.isLoading"
    @submit.prevent="purchase"
  >
    <div class="field">
      <label>Card Information</label>
      <div
        ref="card"
        class="align-center"
      >
        Loading...
      </div>
    </div>

    <slot />
  </form>
</template>

<script>
import SERVICES from '@/lib/services'
import utils from '@/lib/utils'

var stripe; var elements; var card

export default {
  props: ['submit', 'handler'],
  mounted () {
    var _ = this

    utils.cachedLoadExternal('https://js.stripe.com/v3/', function () {
      // stripe = stripe || window.Stripe('pk_test_ovSgIfRBzeqGwOYQl6P39IR300ktMwyAXW');
      stripe = stripe || window.Stripe(atob('cGtfbGl2ZV9GZDZwUUtwMWkwMUtnVlE1aFFhWTlBOG0wMEU3ak43Y2hK'))
      elements = elements || stripe.elements()
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
      })

      card.addEventListener('change', function (event) {
        if (event.error) {
          _.handler.error(event.error.message)
        } else {
          _.handler.error(undefined)
        }
      })

      card.mount(_.$refs.card)
    })
  },
  methods: {
    purchase () {
      var _ = this

      _.handler.error(undefined)
      _.handler.isLoading = true

      stripe.createToken(card).then(function (result) {
        if (result.error) {
          _.handler.error(result.error.message)
        } else {
          SERVICES[0].request({}, {}, {
            action: 'subscribe',
            token: result.token.id
          }, function (err, response) {
            if (err) {
              _.handler.error(err.message)
            } else if (response.body) {
              if (response.status === 200) {
                _.submit(response.body)
              } else {
                _.handler.error(response.body)
              }
            } else {
              console.error(response)
              _.handler.error('Something went wrong.')
            }
          })
        }
      }).catch(function (err) {
        _.handler.error(err.message)
      })
    }
  }
}
</script>
