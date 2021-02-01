import { reactive, computed } from 'vue'
import { Superstore } from 'vue-superstore'
import feed from './feed.js'
import identity from './identity.js'
import item from './item.js'

export default function () {
  return new Superstore(reactive, computed, {
    feed,
    identity,
    item
  })
}
