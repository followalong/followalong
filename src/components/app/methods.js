import { reactive } from 'vue'
import crypt from './crypt.js'
import utils from './utils'
import actionsForIdentities from './actions/identities'
import actionsForIdentitiesKeychain from './actions/identities-keychain'

const ONE_MINUTE = 1000 * 60 * 1

let nextFeedFetcher

var methods = {
  subscribe: actionsForIdentities.subscribe,
  unsubscribeFeed: actionsForIdentities.unsubscribeFeed,
  fetchAllFeeds: actionsForIdentities.fetchAllFeeds,
  fetchNextFeed: actionsForIdentities.fetchNextFeed,
  hideHint: actionsForIdentities.hideHint,
  hintIsShown: actionsForIdentities.hintIsShown,
  addItemsToIdentity: actionsForIdentities.addItemsToIdentity,

  decryptIdentity: actionsForIdentitiesKeychain.decryptIdentity,
  saveKey: actionsForIdentitiesKeychain.saveKey,
  saveToInMemoryKeychain: actionsForIdentitiesKeychain.saveToInMemoryKeychain,
  saveToInStoreKeychain: actionsForIdentitiesKeychain.saveToInStoreKeychain,

  setIdentity (app, identity, override) {
    identity = reactive(identity)

    if (identity.constructor.name !== 'Instance') {
      throw new Error('Identity is not an Instance')
    }

    app.identity = identity
    app.identity.isLoading = true

    return new Promise((resolve, reject) => {
      app.decryptIdentity(app.keychain, app.store, identity).then(async () => {
        identity.saveLocal = () => {
          return new Promise((resolve) => {
            utils.trimItems(identity)

            if (identity.services.local.strategy === 'rotate') {
              const key = utils.generateId()
              actionsForIdentitiesKeychain.saveToInMemoryKeychain(app.keychain, identity, key)
              actionsForIdentitiesKeychain.saveToInStoreKeychain(app.keychain, app.store, identity, key)
            }

            app.store.setItem(
              identity.id,
              crypt.en(
                app.keychain,
                identity,
                identity.toLocal()
              )
            )

            resolve()
          })
        }

        await identity.saveLocal()

        clearTimeout(nextFeedFetcher)

        app.identity.isLoading = false

        app.fetchAllFeeds(identity, override, () => {
          nextFeedFetcher = setTimeout(() => {
            app.fetchNextFeed(app.identity)
          }, ONE_MINUTE)
        })

        resolve()
      }).catch(reject)
    })
  },

  toggleSidebar (forceHide) {
    var _ = this

    if (forceHide || _.app.sidebarClass === 'show') {
      _.app.sidebarClass = ''
      document.body.style.overflow = ''
    } else {
      _.app.sidebarClass = 'show'
      document.body.style.overflow = 'hidden'
    }
  },

  blankifyLinks (str) {
    return utils.stripScriptsAndStyles(
      (str || '')
        .replace(/target=['"]?[^"']+['"\s>]?/g, '')
        .replace(/<a([^>]+)>?/g, '<a$1 target="_blank">')
    )
  },

  addIdentity (app, identity) {
    utils.setIdentityDefaults(identity)

    return app.state.add('identities', identity)
  }

}

export default methods
