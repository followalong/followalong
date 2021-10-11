# frozen_string_literal: true

require 'net/https'
require 'uri'

module FollowAlong
  class RSS
    TIMEOUT = 5
    USER_AGENT = 'Mozilla /5.0 (Compatible MSIE 9.0;Windows NT 6.1;WOW64; Trident/5.0)'

    def perform(data = {})
      perform_request data
    end

    private

    def perform_request(data = {}, limit = 5)
      return { status: 400, body: 'HTTP redirect too deep' } if limit.zero?

      url = data['url']
      url = Base64.decode64 url if url[0..3] != 'http'
      uri = URI url

      req = if data['method'].to_s.downcase == 'post'
              Net::HTTP::Post.new(uri, data)
            else
              Net::HTTP::Get.new(uri)
            end

      data['headers'] ||= {}
      data['headers']['User-Agent'] ||= USER_AGENT

      data['headers'].each do |key, value|
        req[key] = value
      end

      response = Net::HTTP.start(uri.hostname, uri.port,
                                 use_ssl: uri.scheme == 'https',
                                 open_timeout: TIMEOUT,
                                 ssl_timeout: TIMEOUT,
                                 read_timeout: TIMEOUT,
                                 keep_alive_timeout: TIMEOUT) do |http|
        http.request(req)
      end

      case response
      when Net::HTTPRedirection
        data['url'] = response['location']
        perform_request data, limit - 1
      else
        {
          status: response.code,
          headers: response.to_hash,
          body: response.body.force_encoding('utf-8')
        }
      end
    rescue StandardError => e
      {
        status: 401,
        headers: {},
        body: e.message
      }
    end
  end
end
