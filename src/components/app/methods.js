import { reactive } from 'vue'
import crypt from './crypt.js'
import models from '@/models/index.js'
import seedIdentity from '@/components/app/seed'
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
  getAskSecretKey: actionsForIdentitiesKeychain.getAskSecretKey,
  saveKey: actionsForIdentitiesKeychain.saveKey,

  setIdentity (app, identity, override) {
    identity = reactive(identity)

    if (identity.constructor.name !== 'Instance') {
      throw new Error('Identity is not an Instance')
    }

    app.identity = identity
    app.loading = true

    app.decryptIdentity(app.keychain, app.store, identity, function () {
      identity.save = (done) => {
        identity.saveLocal(() => {
          identity.sync(done)
        })
      }

      identity.saveLocal = (done) => {
        utils.trimItems(identity)

        app.store.setItem(
          identity.id,
          crypt.en(
            app.keychain,
            app.store,
            identity,
            utils.mappers.IDENTITY_LOCAL(identity)
          )
        )

        if (typeof done === 'function') {
          done()
        }
      }

      identity.saveLocal()

      clearTimeout(nextFeedFetcher)

      app.loading = false

      app.fetchAllFeeds(identity, override, function () {
        nextFeedFetcher = setTimeout(function () {
          app.fetchNextFeed(app.identity)
        }, ONE_MINUTE)
      })
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

    return models.identity.create(identity)
  },

  setupApp (app) {
    app.loading = true

    utils.constructIdentities(app, (identities, keychain) => {
      app.keychain = keychain

      if (identities && identities.length) {
        identities.forEach((identity) => {
          app.addIdentity(app, identity)
        })

        app.setIdentity(app, app.identities[0])
      } else {
        const newIdentity = app.addIdentity(app, seedIdentity)

        newIdentity._feeds.forEach((feed) => {
          newIdentity.addFeed(feed)
        })

        app.setIdentity(app, newIdentity)
        app.$router.push('/splash')
      }
    })
  }
}

export default methods
