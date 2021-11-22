# frozen_string_literal: true

require 'net/https'
require 'uri'

module FollowAlong
  class Search
    def perform(data = {})
      return [{ name: 'Feed', url: data['q'], source: 'Direct' }] if data['q'].start_with?('http')

      Faraday.new('http://example.com', headers: {
        'User-Agent' => 'FollowAlong.net'
      }).get


      response = Net::HTTP.start(uri.hostname, uri.port,
                                 use_ssl: uri.scheme == 'https',
                                 open_timeout: TIMEOUT,
                                 ssl_timeout: TIMEOUT,
                                 read_timeout: TIMEOUT,
                                 keep_alive_timeout: TIMEOUT) do |http|
        http.request(req)
      end

      # GET DDG Results
      # Visit first
      # Parse rss link

      body = response.body.force_encoding('utf-8')

      https://api.duckduckgo.com/?q=DuckDuckGo&amp;format=json

      FirstURL

      return [{ name: page.title, url: rssUrl, source: 'Search' }]
    rescue
      []
    end
  end
end
