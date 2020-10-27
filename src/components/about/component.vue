<template>
  <div class="about">
    <div class="narrow-container">
      <p>
        FollowAlong is a website that knows how to get new content from the people and things you care about.
        <strong>Most importantly, all of your data stays <em>right here</em> &mdash; in <em>this</em> browser (we don't collect analytics and offer an optional you-to-you encrypted "syncing" server for multi-device support).</strong>
      </p>

      <p>
        FollowAlong uses RSS, which means you can follow YouTube channels, Blogs, Calendars, Podcast, team activities, and much more.
        We've added some content to let you see how it feels to use FollowAlong.
        <!-- <em>It's just you here</em> &mdash; nobody is listening in (check the Developer tools if you don't believe me). -->
        <!-- Eventually, you can enter an RSS/Atom feed URL in the "Search" bar above to follow others from YouTube, Twitter, etc. -->
      </p>

      <h2>What's different about FollowAlong?</h2>

      <p>
        In most social networks, everyone's data is stored in ONE central place.
        This means that your personal information &mdash; what you like and share, who you follow &mdash; gets saved on a server somewhere that's out of your hands (usually by a company that sells your data).
        In turn, that SINGLE company controls what you see &mdash; news, content, articles, recommendations &mdash; and how you see it.
        If you're concerned about online privacy at all, this is <em>not sustainable</em>.
      </p>

      <p>
        FollowAlong decentralizes the paradigm.
        Once you choose which feeds to follow, your own device becomes your server, storage, and internet connection.
        It regularly checks for fresh content and stores it on your device.
        If you choose, you can sync it (encrypted end-to-end) to other devices.
        <span class="highlight">As a result, your content comes <em>directly</em> from the source with no virtually censorship and no manipulation &mdash; just freedom.</span>
        Check it out – there are no ads, trackers, or any other shenanigans on FollowAlong.
      </p>

      <!-- <p>
        By decentralizing with end-to-end local, interactions become more honest, more truthful, and more personal.
        Intentions and incentives such  View counts, likes, and downvotes disappear.
      </p> -->

      <h2>How can others follow <em>YOU</em>?</h2>

      <p>
        Like email, you can choose your own "hosting provider" or host your own.
        People can follow ANY existing RSS feed (WordPress, YouTube, Joomla, Drupal, Podcast platform, Intranets, Event Calendars, make your own, etc).
        We'd recommend that you use your website as the main feed to publicize as it has the least chance of bowing to censorship.
      </p>

      <h2>The Tech Specs</h2>

      <p>
        The goal of FollowAlong is an end-to-end encrypted "social" network.
        Under the hood, it's just a little HTML, VueJS, and CSS that works together to fetch RSS feeds.
        You can use FollowAlong here at {{domain}}.
        To see the source code, visit <a href="https://github.com/followalong/followalong" target="_blank" class="link">GitHub</a>.
        You can even host your own anywhere you like (even locally).
        Data is stored via LocalForage (IndexedDB, LocalStorage, etc) on your own device &mdash; and never sends any data anywhere other than the feeds you follow.
        Only the feeds you follow know that you're following them.
        At any time, you can download a JSON file of your data in <router-link to="/settings" class="link">Settings</router-link>.
      </p>

      <p>
        Cross-Origin domain issues occur trying fetch items from other domains.
        By default, we set the Proxy to a passthrough server so you can grab content from YouTube and other popular sites (we don't record any data).
        Don't trust us? Good. Set your own "Passthrough Proxy" server in <router-link to="/settings" class="link">Settings</router-link>.
        We think CORS on RSS feeds is silly &mdash; hopefully it will become the standard to NOT have it.
        We can easily integrate authorized feeds and create a new paradigm of pay-for-access feeds.
      </p>

      <h2>
        What are the drawbacks?
        <a href="javascript:;" v-if="!showDrawbacks" v-on:click="showDrawbacks = true" class="link">Just a handful...</a>
      </h2>

      <div v-if="showDrawbacks">
        <p>
          From where we sit, there are a handful of drawbacks right now, but they can all be solved quickly with quick, effective development.
        </p>

        <p>
          <strong>Not-So-Live Data and Bandwidth.</strong>
          Your browser searches for new info from everyone you follow when you load the page, every 15 minutes.
          You can also fetch manually.
          Also, the publishing server can specify ETAGs, support delta queries, and implement caching.
          Regardless, isn't the privacy worth a little more bandwidth?
          Ultimately, the bandwidth isn't <em>that</em> much more.
        </p>

        <p>
          <strong>Discover-ability (for now).</strong>
          This is a very important space to figure out because it is how the "network" grows.
          We're working on it &mdash; perhaps RSS feeds can set others "endorsed" feeds?
          On the flipside, once you gain a follower on FollowAlong, you are directly connected to them, so you don't have to worry about silly algorithms not notifying people of your updates.
        </p>

        <p>
          <strong>Verify-ability.</strong>
          How do we verify that you are who you say you are?
          There are a few ways we can do this.
          We'll get into the nitty-gritty when we start building the publishing tools.
        </p>

        <p>
          <strong>Comment-ability.</strong>
          We're looking into supporting the major players such as Discourse, WordPress, and others.
          More to come soon.
        </p>
      </div>

      <h2>
        How do I use FollowAlong on another device?
      </h2>

      <p>
        Right now, you can't "sync" between devices, but you can follow the same things.
        Visit the <router-link to="/settings" class="link">Settings</router-link> page and copy your "Config" file.
        On your other device, visit the <router-link to="/settings" class="link">Settings</router-link> page and paste in the config file – that's it!
      </p>

      <br><br>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showDrawbacks: false
    }
  },
  computed: {
    domain() {
      return window.location.host;
    }
  }
};
</script>
