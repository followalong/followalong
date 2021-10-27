class ServiceAdapter {
  constructor (adapterOptions, serviceData) {
    this.data = serviceData

    for (const key in adapterOptions) {
      this[key] = adapterOptions[key]
    }
  }

  get () {
    return Promise.reject(new Error('`Get` is not supported by this service.'))
  }

  save () {
    return Promise.reject(new Error('`Save` is not supported by this service.'))
  }

  destroy () {
    return Promise.reject(new Error('`Destroy` is not supported by this service.'))
  }

  rss () {
    return Promise.reject(new Error('`RSS` is not supported by this service.'))
  }

  search () {
    return Promise.reject(new Error('`Search` is not supported by this service.'))
  }
}

export default ServiceAdapter
