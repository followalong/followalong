import { reactive } from 'vue'
import seed from '@/components/app/seed'
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

  setIdentity (identity, override) {
    var _ = this

    identity = reactive(identity)

    utils.setIdentityDefaults(identity)

    _.app.identity = identity
    _.app.loading = true

    _.decryptIdentity(identity, function () {
      utils.setIdentityDefaults(identity)

      identity.save = (done) => {
        _.app.saveLocal(identity, () => {
          _.app.sync(identity, done)
        })
      }

      _.app.saveLocal(identity)

      clearTimeout(nextFeedFetcher)

      _.app.loading = false

      _.fetchAllFeeds(identity, override, function () {
        nextFeedFetcher = setTimeout(function () {
          _.fetchNextFeed(_.app.identity)
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

  updateNow () {
    setInterval(() => {
      this.now = new Date()
    }, ONE_MINUTE)
  },

  setupApp (app) {
    app.loading = true

    utils.constructIdentities(app, (identities, keychain) => {
      app.keychain = keychain

      if (!identities || !identities.length) {
        identities = seed
        app.$router.push('/splash')
      }

      for (var i = identities.length - 1; i >= 0; i--) {
        utils.setIdentityDefaults(identities[i])
      }

      app.identities = identities
      app.setIdentity(identities[0])
      app.updateNow()
    })
  }
}

export default methods
