import { reactive } from 'vue'
import seed from '@/components/app/seed'
import utils from './utils'
import actionsForFeeds from './actions/feeds'
import actionsForHints from './actions/hints'
import actionsForIdentities from './actions/identities'
import actionsForItems from './actions/items'

let nextFeedFetcher

const TWO_MINUTES = 1000 * 60 * 1

var methods = {
  fetchAllFeeds: actionsForFeeds.fetchAllFeeds,
  fetchNextFeed: actionsForFeeds.fetchNextFeed,
  fetchFeed: actionsForFeeds.fetchFeed,
  subscribe: actionsForFeeds.subscribe,
  unsubscribeFeed: actionsForFeeds.unsubscribeFeed,

  hideHint: actionsForHints.hideHint,
  hintIsShown: actionsForHints.hintIsShown,

  findService: actionsForIdentities.findService,
  decryptIdentity: actionsForIdentities.decryptIdentity,
  getAskSecretKey: actionsForIdentities.getAskSecretKey,
  saveKey: actionsForIdentities.saveKey,
  sync: actionsForIdentities.sync,
  save: actionsForIdentities.save,
  saveLocal: actionsForIdentities.saveLocal,

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
        }, TWO_MINUTES)
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
    }, 60000)
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
