import localForage from 'localforage'
import ServiceAdapter from '../service.js'
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

class LocalServiceAdapter extends ServiceAdapter {
  constructor (adapterOptions, serviceData) {
    super(adapterOptions, serviceData)

    this.db = localForage.createInstance({
      name: 'followalong-v1'
    })

    this.data.encryptionStrategy = this.data.encryptionStrategy || 'none'
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
      .filter(LIMIT_ITEMS(100))

    return identityData
  }
}

export default LocalServiceAdapter
