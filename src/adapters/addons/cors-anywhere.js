import AddonAdapter from '../addon.js'

class CORSAnywhere extends AddonAdapter {
  constructor (adapterOptions, addonData) {
    super(adapterOptions, addonData)

    this.adapter = 'cors-anywhere'
    this.name = this.data.name || 'CORS Anywhere'
    this.description = this.data.description || 'Use the "CORS Anywhere" demo server! Please don\'t abuse this addon, as you can <a href="https://github.com/Rob--W/cors-anywhere" target="_blank" class="link" onclick="event.stopImmediatePropagation();">quickly deploy your own version</a> to Heroku (or elsewhere).'
    this.data.url = this.data.url || 'https://cors-anywhere.herokuapp.com/'
    this.supports = ['rss']
    this.fields = {
      url: {
        type: 'text',
        label: 'URL',
        required: true,
        placeholder: 'https://cors-anywhere.herokuapp.com/'
      }
    }
  }

  rss (url) {
    const x = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
      if (!url) return reject(new Error('No URL supplied.'))

      x.open('GET', (this.data.url || '') + url)

      x.onload = x.onerror = () => {
        if (x.status === 200) {
          resolve({
            status: x.status,
            body: x.responseText
          })
        } else {
          reject(new Error(x.responseText))
        }
      }

      x.send()
    })
  }
}

export default CORSAnywhere
