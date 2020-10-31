import feedFetcherDuration from './feed-fetcher-duration'
import filters from './filters'
import generateId from './generate-id'
import isBase64 from './is-base-64'
import mappers from './mappers'
import mergeData from './merge-data'
import setIdentityDefaults from './set-identity-defaults'
import sorters from './sorters'
import stripScriptsAndStyles from './strip-scripts-and-styles'
import timeAgo from './time-ago'
import trimItems from './trim-items'
import cachedLoadExternal from './cached-load-external'
import constructIdentities from './construct-identities'
import getSrc from './get-src'

const HALF_HOUR = 1000 * 60 * 60 * 0.5

export default {
  HALF_HOUR,

  cachedLoadExternal,
  constructIdentities,
  filters,
  generateId,
  isBase64,
  mappers,
  mergeData,
  sorters,
  stripScriptsAndStyles,
  timeAgo,
  trimItems,

  feedFetcherDuration: feedFetcherDuration(HALF_HOUR),
  setIdentityDefaults: setIdentityDefaults(generateId),

  getAudioSrc: getSrc.audio,
  getVideoSrc: getSrc.video
}
