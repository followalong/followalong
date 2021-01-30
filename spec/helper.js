import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '@/router'
import setIdentityDefaults from '@/components/app/utils/set-identity-defaults.js'
import App from '@/components/app/component.vue'
import store from '@/store'
import addIcons from '@/add-icons.js'
import models from '@/models/index.js'

const mountApp = async (options) => {
  options = options || {}
  options.identities = options.identities || [{}]

  options.identities.forEach(async (identity) => {
    identity.id = identity.id || Math.random().toString()
    identity.feeds = identity.feeds || []
    setIdentityDefaults(() => identity.id)(identity)
    await store.setItem(identity.id, identity)
  })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: routes
  })

  router.push('/')

  await router.isReady()

  const app = await mount(App, {
    propsData: options.props,
    global: {
      plugins: [router, addIcons]
    }
  })

  app.go = (path) => {
    return router.push(path)
  }

  await nextTick()

  return app
}

export {
  mountApp,
  flushPromises,
  nextTick
}
