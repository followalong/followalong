import { reactive } from 'vue'

export default function (generateId) {
  return function (identity) {
    identity.id = identity.id || generateId()
    identity.name = identity.name || '...'
    identity.items = identity.items || reactive([]) // TODO: Use vue-superstore
    identity.hints = identity.hints || []

    identity.services = identity.services || {}
    identity.services.custom = identity.services.custom || []
    identity.services.rss = identity.services.rss || { symlink: 'followalong-free' }
    identity.services.sync = identity.services.sync || { symlink: 'followalong-none' }
    identity.services.publish = identity.services.publish || { symlink: 'followalong-none' }
    identity.services.search = identity.services.search || { symlink: 'followalong-free' }
    identity.services.media = identity.services.media || { symlink: 'followalong-none' }
    identity.services.local = identity.services.local || {
      strategy: 'none'
    }
    identity.services.local.maxReadCount = typeof identity.services.local.maxReadCount === 'undefined' ? 150 : parseInt(identity.services.local.maxReadCount)

    if (typeof identity._decrypted === 'undefined') {
      identity._decrypted = false
    }
  }
}
