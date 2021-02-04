import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '@/router'
import setIdentityDefaults from '@/components/app/utils/set-identity-defaults.js'
import generateId from '@/components/app/utils/generate-id.js'
import App from '@/components/app/component.vue'
import store from '@/store'
import addIcons from '@/add-icons.js'
import keychain from '@/keychain'

const storeIdentity = (keychain, identity, id, key) => {
  return new Promise(async (resolve) => {
    await keychain.saveKey(id, key || 'none')

    await store.setItem(id, typeof identity === 'object' ? JSON.stringify(identity) : identity)

    resolve(identity)
  })
}

const mountApp = (identity, id, key) => {
  return new Promise(async (resolve) => {
    await store.clear()
    await keychain.clear()

    if (typeof identity === 'string') {
      await storeIdentity(keychain, identity, id, key)
    } else if (typeof identity === 'object') {
      setIdentityDefaults(identity)
      identity.feeds = identity.feeds || []
      await storeIdentity(keychain, identity, identity.id, key)
    }

    const router = createRouter({
      history: createMemoryHistory(),
      routes: routes
    })

    router.push('/')

    await router.isReady()

    const app = await mount(App, {
      global: {
        plugins: [router, addIcons]
      }
    })

    // TODO: Not tearing down correctly
    app.vm.fetchAllFeeds = () => { }

    app.go = (path) => {
      return router.push(path)
    }

    // await nextTick()
    await flushPromises()

    resolve(app)
  })
}

export {
  mountApp,
  flushPromises,
  nextTick,
  storeIdentity
}
