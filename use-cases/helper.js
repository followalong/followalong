// import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '@/router'
// import setIdentityDefaults from '@/lib/utils/set-identity-defaults.js'
// import generateId from '@/lib/utils/generate-id.js'
import App from '@/components/app/component.vue'
// import store from '@/lib/store'
import addIcons from '@/add-icons.js'
// import keychain from '@/lib/keychain'

// const storeIdentity = (keychain, identity, id, key) => {
//   return new Promise(async (resolve) => {
//     await keychain.saveKey(id, key || 'none')
//
//     await store.setItem(id, typeof identity === 'object' ? JSON.stringify(identity) : identity)
//
//     resolve(identity)
//   })
// }

// const mountApp = (identity, id, key) => {
//   return new Promise(async (resolve) => {
//     await store.clear()
//     await keychain.clear()
//
//     if (typeof identity === 'string') {
//       await storeIdentity(keychain, identity, id, key)
//     } else if (typeof identity === 'object') {
//       setIdentityDefaults(identity)
//       await storeIdentity(keychain, identity, identity.id, key)
//     }
//
//     const router = createRouter({
//       history: createMemoryHistory(),
//       routes: routes
//     })
//
//     router.push('/')
//
//     await router.isReady()
//
//     const app = await mount(App, {
//       global: {
//         plugins: [router, addIcons]
//       }
//     })
//
//     // TODO: Not tearing down correctly
//     app.vm.fetchAllFeeds = () => { }
//
//     app.go = (path) => {
//       return router.push(path)
//     }
//
//     // await nextTick()
//     await flushPromises()
//
//     resolve(app)
//   })
// }

const mountApp = () => {
  return new Promise(async (resolve) => {
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

    app.go = (path) => {
      return router.push(path)
    }

    await flushPromises()

    resolve(app)
  })
}

// const buildIdentityWithFeedAndItems = (items, feed, identity) => {
//   identity = identity || {}
//   feed = feed || {}
//
//   identity.feeds = [feed]
//   identity.items = items || []
//
//   feed.url = feed.url || `https://${Math.random()}.com/items.rss`
//
//   items.forEach((item) => {
//     item.guid = item.guid || Math.random().toString()
//     item.feedURL = item.feedURL || feed.url
//   })
//
//   return identity
// }

export {
  flushPromises,
  mountApp
}
