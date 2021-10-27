import ServiceAdapter from '../service.js'

class LocalServiceAdapter extends ServiceAdapter {
  constructor (adapterOptions, serviceData) {
    super(adapterOptions, serviceData)

    this.data.encryptionStrategy = this.data.encryptionStrategy || 'none'
  }
}

export default LocalServiceAdapter
