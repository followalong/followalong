import utils from './utils'

var identities = [
  {
    id: utils.generateId(),
    name: 'My Account',
    feeds: [
      {
        name: 'Signal v. Noise',
        url: 'https://m.signalvnoise.com/feed/',
        loading: false,
        paused: false
      },
      {
        name: 'FiveThirtyEight',
        url: 'https://fivethirtyeight.com/contributors/nate-silver/feed/',
        loading: false,
        paused: false
      },
      {
        name: 'Glenn Greenwald',
        url: 'https://greenwald.substack.com/feed',
        loading: false,
        paused: false
      },
      // {
      //     url: 'https://www.theatlantic.com/feed/channel/ideas/'
      // },
      // {
      //     name: 'John Stossel',
      //     url: 'https://reason.com/tag/john-stossel/feed/',
      //     loading: false,
      //     paused: false
      // },
      {
        name: 'Dude Perfect',
        url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCRijo3ddMTht_IHyNSNXpNQ',
        loading: false,
        paused: false
      },
      {
        name: 'Freakonomics',
        url: 'http://freakonomics.com/feed/',
        loading: false,
        paused: false
      },
      {
        name: 'National Geographic',
        url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCpVm7bg6pXKo1Pr6k5kxG9A',
        loading: false,
        paused: false
      },
      {
        name: 'Earthling Ed',
        url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCVRrGAcUc7cblUzOhI1KfFg',
        loading: false,
        paused: false
      }
    ]
  }
]

// {
//   id: utils.generateId(),
//   name: 'The Library of Economics and Liberty',
//   url: 'http://econlog.econlib.org/index.xml',
// }
// http://www.ft.com/stream/sectionsId/MTA3-U2VjdGlvbnM=?format=rss
// https://mises.org/dailyarticles.xml

// {
//   id: utils.generateId(),
//   name: 'Reuters',
//   url: 'http://feeds.reuters.com/reuters/topNews.rss?format=xml',
// },
// {
//   id: utils.generateId(),
//   name: 'Signal v. Noise',
//   url: 'https://m.signalvnoise.com/feed/',
// },
// {
//   id: utils.generateId(),
//   name: 'Daily Wire',
//   url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCaeO5vkdj5xOQHp4UmIN6dw',
// },
// {
//   id: utils.generateId(),
//   name: 'Hacker News',
//   url: 'https://news.ycombinator.com/rss',
// }

export default identities
