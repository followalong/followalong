import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '@/router'
import setIdentityDefaults from '@/components/app/utils/set-identity-defaults.js'
import generateId from '@/components/app/utils/generate-id.js'
import App from '@/components/app/component.vue'
import store from '@/store'
import addIcons from '@/add-icons.js'

const storeIdentity = (identity) => {
  return new Promise(async (resolve) => {
    setIdentityDefaults(generateId)(identity)

    identity.feeds = identity.feeds || []

    await store.setItem(`key-${identity.id}`, '')
    await store.setItem(identity.id, identity)

    resolve(identity)
  })
}

const mountApp = (identity) => {
  return new Promise(async (resolve) => {
    await store.clear()

    if (identity) {
      await storeIdentity(identity)
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
