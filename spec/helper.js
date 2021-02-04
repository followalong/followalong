import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '@/router'
import setIdentityDefaults from '@/components/app/utils/set-identity-defaults.js'
import generateId from '@/components/app/utils/generate-id.js'
import App from '@/components/app/component.vue'
import store from '@/store'
import addIcons from '@/add-icons.js'

const storeIdentity = (identity, id, key) => {
  return new Promise(async (resolve) => {
    await store.setItem(`key-${id}`, key || '')
    await store.setItem(id, identity)

    resolve(identity)
  })
}

const mountApp = (identity, id, key) => {
  return new Promise(async (resolve) => {
    await store.clear()

    if (typeof identity === 'string') {
      await storeIdentity(identity, id, key)
    } else if (typeof identity === 'object') {
      setIdentityDefaults(identity)
      identity.feeds = identity.feeds || []
      await storeIdentity(identity, identity.id)
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

    await nextTick()

    resolve(app)
  })
}

export {
  mountApp,
  flushPromises,
  nextTick,
  storeIdentity
}
