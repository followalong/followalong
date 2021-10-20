import cachedLoadExternal from './cached-load-external'
import constructIdentities from './construct-identities'
import copyAttrs from './copy-attrs'
import feedFetcherDuration from './feed-fetcher-duration'
import filters from './filters'
import generateId from './generate-id'
import getSrc from './get-src'
import isBase64 from './is-base-64'
import mergeData from './merge-data'
import setIdentityDefaults from './set-identity-defaults'
import sorters from './sorters'
import stripScriptsAndStyles from './strip-scripts-and-styles'
import timeAgo from './time-ago'
import trimItems from './trim-items'

const HALF_HOUR = 1000 * 60 * 60 * 0.5

export default {
  HALF_HOUR,

  cachedLoadExternal,
  copyAttrs,
  constructIdentities,
  filters,
  generateId,
  isBase64,
  mergeData,
  sorters,
  stripScriptsAndStyles,
  timeAgo,
  trimItems,

  feedFetcherDuration: feedFetcherDuration(HALF_HOUR),
  setIdentityDefaults,

  getAudioSrc: getSrc.audio,
  getVideoSrc: getSrc.video,
  getImageSrc: getSrc.image
}
