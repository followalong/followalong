import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '../src/router'
import App from '../src/components/app/component.vue'

const mountApp = () => {
  return new Promise(async (resolve) => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes
    })

    router.push('/')

    await router.isReady()

    const app = await mount(App, {
      global: {
        plugins: [router]
      }
    })

    // await nextTick()
    await flushPromises()

    resolve(app)
  })
}

export {
  flushPromises,
  mountApp
}
