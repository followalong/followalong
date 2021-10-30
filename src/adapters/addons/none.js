// {
//   id: 'followalong-none',
//   name: 'None',
//   description: 'No addon will be used.',
//   supports: 'rss,sync,search',
//   request () {
//     return Promise.resolve()
//   }
// }

import AddonAdapter from '../addon.js'

class NoneAddonAdapter extends AddonAdapter {
  constructor (adapterOptions, addonData) {
    super(adapterOptions, addonData)
    this.name = this.data.name || 'None'
    this.supports = ['rss', 'search']
  }
}

export default NoneAddonAdapter
