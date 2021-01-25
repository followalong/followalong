import { reactive } from 'vue'
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
  findService: actionsForIdentities.findService,
  hideHint: actionsForIdentities.hideHint,
  hintIsShown: actionsForIdentities.hintIsShown,
  save: actionsForIdentities.save,
  saveLocal: actionsForIdentities.saveLocal,
  sync: actionsForIdentities.sync,
  addFeedToIdentity: actionsForIdentities.addFeedToIdentity,
  addItemsToIdentity: actionsForIdentities.addItemsToIdentity,

  decryptIdentity: actionsForIdentitiesKeychain.decryptIdentity,
  getAskSecretKey: actionsForIdentitiesKeychain.getAskSecretKey,
  saveKey: actionsForIdentitiesKeychain.saveKey,

  setIdentity (app, identity, override) {
    identity = reactive(identity)

    utils.setIdentityDefaults(identity)

    app.identity = identity
    app.loading = true

    app.decryptIdentity(identity, function () {
      utils.setIdentityDefaults(identity)

      identity.save = (done) => {
        app.saveLocal(identity, () => {
          app.sync(identity, done)
        })
      }

      app.saveLocal(identity)

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
    app.identities.push(identity)
  },

  setupApp (app) {
    app.loading = true

    utils.constructIdentities(app, (identities, keychain) => {
      app.keychain = keychain

      if (identities && identities.length) {
        identities.forEach((identity) => {
          utils.setIdentityDefaults(identity)
          app.addIdentity(app, identity)
        })

        app.setIdentity(app, identities[0])
      } else {
        utils.setIdentityDefaults(seedIdentity)

        seedIdentity._feeds.forEach((feed) => {
          app.addFeedToIdentity(seedIdentity, feed)
        })

        app.addIdentity(app, seedIdentity)
        app.setIdentity(app, seedIdentity)
        app.$router.push('/splash')
      }
    })
  }
}

export default methods
