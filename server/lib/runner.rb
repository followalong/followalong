# frozen_string_literal: true

require_relative 'actions/rss'
require_relative 'actions/search'
require_relative 'actions/subscribe'

module FollowAlong
  class Runner
    ALLOWED_METHODS = %w[rss search subscribe].freeze # sync publish media

    def run(action, data = {}, _context = {})
      if ALLOWED_METHODS.include? action
        send action, data
      else
        { status: 403, body: 'Unauthorized' }
      end
    end

    private

    def rss(data = {})
      FollowAlong::RSS.new.perform data
    end

    def search(data = {})
      FollowAlong::Search.new.perform data
    end

    def subscribe(data = {})
      FollowAlong::Subscribe.new.perform data
    end
  end
end
