// import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '@/router'
// import setIdentityDefaults from '@/lib/utils/set-identity-defaults.js'
// import generateId from '@/lib/utils/generate-id.js'
import App from '@/components/app/component.vue'
// import store from '@/lib/store'
import addIcons from '@/add-icons.js'
// import keychain from '@/lib/keychain'

// const storeIdentity = (keychain, identity, id, key) => {
//   return new Promise(async (resolve) => {
//     await keychain.saveKey(id, key || 'none')
//
//     await store.setItem(id, typeof identity === 'object' ? JSON.stringify(identity) : identity)
//
//     resolve(identity)
//   })
// }

// const mountApp = (identity, id, key) => {
//   return new Promise(async (resolve) => {
//     await store.clear()
//     await keychain.clear()
//
//     if (typeof identity === 'string') {
//       await storeIdentity(keychain, identity, id, key)
//     } else if (typeof identity === 'object') {
//       setIdentityDefaults(identity)
//       await storeIdentity(keychain, identity, identity.id, key)
//     }
//
//     const router = createRouter({
//       history: createMemoryHistory(),
//       routes: routes
//     })
//
//     router.push('/')
//
//     await router.isReady()
//
//     const app = await mount(App, {
//       global: {
//         plugins: [router, addIcons]
//       }
//     })
//
//     // TODO: Not tearing down correctly
//     app.vm.fetchAllFeeds = () => { }
//
//     app.go = (path) => {
//       return router.push(path)
//     }
//
//     // await nextTick()
//     await flushPromises()
//
//     resolve(app)
//   })
// }

const mountApp = () => {
  return new Promise(async (resolve) => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: routes
    })

    router.push('/')

    await router.isReady()

    const app = await mount(App, {
      global: {
        plugins: [router, addIcons]
      }
    })

    app.click = async (el) => {
      const $el = await app.find(el)
      if (!Object.keys($el).length) {
        throw new Error(`Could not find element: ${el} in ${app.text()}`)
      }
      await $el.trigger('click')
      await app.wait()
    }

    app.submit = async (el) => {
      const $el = await app.find(el)
      if (!Object.keys($el).length) {
        throw new Error(`Could not find element: ${el} in ${app.text()}`)
      }
      await $el.trigger('submit')
      await app.wait()
    }

    app.wait = async () => {
      await flushPromisesAndTimers()
      await flushPromisesAndTimers()
    }

    await app.wait()

    app.initialIdentityId = app.vm.identity.id

    resolve(app)
  })
}

const rawRSSResponse = (item) => {
  return {
    status: 200,
    body: rawRSS(item)
  }
}

const buildServiceToRespondWith = (result) => {
  return jest.fn(() => {
    return {
      request: () => Promise.resolve(result)
    }
  })
}

const rawRSS = (item) => {
  let enclosure = ''

  if (item.videoUrl) {
    enclosure = `<enclosure url="${item.videoUrl}"></enclosure>`
  }

  if (item.audioUrl) {
    enclosure = `<enclosure url="${item.audioUrl}"></enclosure>`
  }

  item.content = item.content || 'This is some random content'
  item.title = item.title || 'This is some random title'
  item.link = item.link || 'https://example.com'

  return `
  <?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0"
    xmlns:content="http://purl.org/rss/1.0/modules/content/"
    xmlns:wfw="http://wellformedweb.org/CommentAPI/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:atom="http://www.w3.org/2005/Atom"
    xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
    xmlns:slash="http://purl.org/rss/1.0/modules/slash/"

    xmlns:georss="http://www.georss.org/georss"
    xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#"
  >
  <channel>
    <title>Signal v. Noise</title>
    <atom:link href="https://m.signalvnoise.com/feed/" rel="self" type="application/rss+xml" />
    <link>https://m.signalvnoise.com</link>
    <description>Strong opinions and shared thoughts on design, business, and tech. By the makers (and friends) of &#60;a href=&#34;https://www.basecamp.com&#34; target=&#34;_blank&#34; rel=&#34;noopener&#34;&#62;Basecamp&#60;/a&#62;. Since 1999.</description>
    <lastBuildDate>Tue, 09 Feb 2021 18:04:31 +0000</lastBuildDate>
    <language>en-US</language>
    <sy:updatePeriod>hourly</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <image>
      <url>https://i1.wp.com/m.signalvnoise.com/wp-content/uploads/2019/01/cropped-svn-icon.gif?fit=32%2C32&#038;ssl=1</url>
      <title>Signal v. Noise</title>
      <link>https://m.signalvnoise.com</link>
      <width>32</width>
      <height>32</height>
    </image>
    <site xmlns="com-wordpress:feed-additions:1">156952158</site>
    <item>
      <title>${item.title}</title>
      <link>${item.link}</link>
      <dc:creator><![CDATA[DHH]]></dc:creator>
      <pubDate>Tue, 09 Feb 2021 18:04:30 +0000</pubDate>
      <category><![CDATA[Uncategorized]]></category>
      <guid isPermaLink="false">https://m.signalvnoise.com/?p=13077</guid>
      <description><![CDATA[Chairman Klein and members of the Senate Industry, Business and Labor Committee- My name is David Heinemeier Hansson, and I’m the CTO and co-founder of Basecamp, a small internet company from Chicago that sells project-management software and email services. I first testified on the topic of big tech monopolies at the House Antitrust Subcommittee&#8217;s field&#8230; <a class="read-more" href="https://m.signalvnoise.com/testimony-before-the-north-dakota-senate-industry-business-and-labor-committee/">keep reading</a>]]></description>
      <content:encoded><![CDATA[${item.content}]]></content:encoded>
      <slash:comments>11</slash:comments>
      <post-id xmlns="com-wordpress:feed-additions:1">12956</post-id>
      ${enclosure}
      </item>
    </channel>
  </rss>
  `
}

jest.useFakeTimers()

const flushPromisesAndTimers = () => {
  jest.runAllTimers()
  return flushPromises()
}

// const buildIdentityWithFeedAndItems = (items, feed, identity) => {
//   identity = identity || {}
//   feed = feed || {}
//
//   identity.feeds = [feed]
//   identity.items = items || []
//
//   feed.url = feed.url || `https://${Math.random()}.com/items.rss`
//
//   items.forEach((item) => {
//     item.guid = item.guid || Math.random().toString()
//     item.feedURL = item.feedURL || feed.url
//   })
//
//   return identity
// }

export {
  mountApp,
  buildServiceToRespondWith,
  rawRSSResponse
}
