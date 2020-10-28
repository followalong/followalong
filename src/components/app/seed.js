import uniqId from 'uniq-id'

var generateId = uniqId.generateUUID('xxxxyxxxxyxxxxyxxxxyxxxxyxxxxyxxxxyxxxxy', 32)
var identities = [
  {
    id: generateId(),
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
        name: 'The Intercept',
        url: 'https://theintercept.com/staff/glenn-greenwald/feed/?rss',
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
//   id: generateId(),
//   name: 'The Library of Economics and Liberty',
//   url: 'http://econlog.econlib.org/index.xml',
// }
// http://www.ft.com/stream/sectionsId/MTA3-U2VjdGlvbnM=?format=rss
// https://mises.org/dailyarticles.xml

// {
//   id: generateId(),
//   name: 'Reuters',
//   url: 'http://feeds.reuters.com/reuters/topNews.rss?format=xml',
// },
// {
//   id: generateId(),
//   name: 'Signal v. Noise',
//   url: 'https://m.signalvnoise.com/feed/',
// },
// {
//   id: generateId(),
//   name: 'Daily Wire',
//   url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCaeO5vkdj5xOQHp4UmIN6dw',
// },
// {
//   id: generateId(),
//   name: 'Hacker News',
//   url: 'https://news.ycombinator.com/rss',
// }

export default identities
