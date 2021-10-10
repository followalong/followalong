# frozen_string_literal: true

require 'net/https'
require 'uri'

module FollowAlong
  class Search
    def perform(data = {})
      if data['q'].start_with? 'http'
        [{ name: 'Feed', url: data['q'], source: 'Direct' }]
      else
        []
      end
    end
  end
end
