import localForage from 'localforage'
import AddonAdapter from '../addon.js'
import sortByReadAndDate from '@/queries/sorters/sort-by-read-and-date.js'

const LIMIT_ITEMS = (n) => {
  let reads = n

  return (item, index) => {
    if (item.savedAt) {
      return true
    }

    if (item.readAt) {
      if (reads > 0) {
        reads--
        return true
      } else {
        return false
      }
    }

    return true
  }
}

class LocalAddonAdapter extends AddonAdapter {
  constructor (adapterOptions, addonData) {
    super(adapterOptions, addonData)
    this.name = this.data.name || 'Local'
    this.supports = ['local']

    this.db = localForage.createInstance({
      name: 'followalong-v1'
    })

    this.data.encryptionStrategy = this.data.encryptionStrategy || 'none'
    this.data.maxReadLimit = this.data.maxReadLimit || 150
  }

  save (identityData, encrypt) {
    return this.db.setItem(
      identityData.id,
      encrypt(this.format(identityData))
    )
  }

  get (id, decrypt) {
    return new Promise((resolve, reject) => {
      this.db.getItem(id)
        .then((identityData) => resolve(decrypt(identityData)))
        .catch(reject)
    })
  }

  remove (id) {
    return this.db.removeItem(id)
  }

  format (identityData) {
    identityData = super.format(identityData)

    identityData.items = identityData.items
      .sort(sortByReadAndDate())
      .filter(LIMIT_ITEMS(this.data.maxReadLimit))

    return identityData
  }
}

export default LocalAddonAdapter
