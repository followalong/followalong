import localForage from 'localforage'
import ServiceAdapter from '../service.js'

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
}

export default LocalServiceAdapter
