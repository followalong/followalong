import { reactive } from 'vue'
import seed from '@/components/app/seed'
import utils from './utils'
import actionsForFeeds from './actions/feeds'
import actionsForIdentities from './actions/identities'
import actionsForIdentitiesKeychain from './actions/identities-keychain'
import actionsForItems from './actions/items'

const ONE_MINUTE = 1000 * 60 * 1

let nextFeedFetcher

var methods = {
  fetchAllFeeds: actionsForFeeds.fetchAllFeeds,
  fetchNextFeed: actionsForFeeds.fetchNextFeed,

  fetchFeed: actionsForFeeds.fetchFeed,
  subscribe: actionsForFeeds.subscribe,
  unsubscribeFeed: actionsForFeeds.unsubscribeFeed,

  hideHint: actionsForIdentities.hideHint,
  hintIsShown: actionsForIdentities.hintIsShown,
  findService: actionsForIdentities.findService,
  sync: actionsForIdentities.sync,
  save: actionsForIdentities.save,
  saveLocal: actionsForIdentities.saveLocal,

  decryptIdentity: actionsForIdentitiesKeychain.decryptIdentity,
  getAskSecretKey: actionsForIdentitiesKeychain.getAskSecretKey,
  saveKey: actionsForIdentitiesKeychain.saveKey,

  read: actionsForItems.read,
  blankifyLinks: actionsForItems.blankifyLinks,
  hasMedia: actionsForItems.hasMedia,
  dateFormat: actionsForItems.dateFormat,
  saveForLater: actionsForItems.saveForLater,
  setMediaVerb: actionsForItems.setMediaVerb,

  setIdentity (identity, override) {
    var _ = this

    identity = reactive(identity)

    utils.setIdentityDefaults(identity)

    _.app.identity = identity
    _.app.loading = true

    _.decryptIdentity(identity, function () {
      utils.setIdentityDefaults(identity)

      _.app.saveLocal()

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
