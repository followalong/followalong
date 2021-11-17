export default {
  name: 'My Account',
  feeds: [
    {
      name: 'FiveThirtyEight',
      url: 'https://fivethirtyeight.com/contributors/nate-silver/feed/'
    },
    {
      name: 'Glenn Greenwald',
      url: 'https://greenwald.substack.com/feed'
    },
    {
      name: 'Ideas | The Atlantic',
      url: 'https://www.theatlantic.com/feed/channel/ideas/'
    },
    {
      name: 'Dude Perfect',
      url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCRijo3ddMTht_IHyNSNXpNQ'
    },
    {
      name: 'Freakonomics',
      url: 'http://freakonomics.com/feed/'
    },
    {
      name: 'National Geographic',
      url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCpVm7bg6pXKo1Pr6k5kxG9A'
    },
    {
      name: 'Human Events Daily with Jack Posobiec',
      url: 'https://feeds.buzzsprout.com/1850247.rss'
    },
    {
      name: 'E&T News',
      url: 'https://eandt.theiet.org/rss/'
    }
  ],
  addons: {
    local: {
      encryptionStrategy: 'none',
      maxReadLimit: 150
    },
    rss: {
      url: 'https://followalong-cors-anywhere.herokuapp.com/',
      adapter: 'cors-anywhere'
    },
    search: {
      adapter: 'followalong-free'
    },
    sync: {}
  }
}
