require 'net/https'
require 'uri'
require 'erb'
require 'cgi'
require 'date'
require 'stripe'
require 'securerandom'

Stripe.api_key = ENV['stripe_api_key']

class FollowAlong
  TIMEOUT = 5
  ALLOWED_METHODS = %w[rss subscribe] # sync publish search media

  attr_reader :event, :context

  def initialize(event = {}, context = {})
    @event = event
    @context = context
  end

  def run
    if ALLOWED_METHODS.include? event['action']
      send event['action']
    else
      { status: 403, body: 'Unauthorized' }
    end
  end

  # def sync
  #   { body: 'Saved.' }
  # end

  def subscribe
    begin
      Stripe::Charge.create({
          amount: 2900,
          currency: 'usd',
          description: '1-Year Unlimited Access',
          source: event['token'],
      })

      token = SecureRandom.urlsafe_base64(32)
      expiry = (Date.today + 366).to_s

      {
        status: 200,
        headers: {},
        body: {
          token: token,
          expiry: expiry
        }
      }
    rescue => e
      {
        status: 401,
        headers: {},
        body: e.message
      }
    end
  end

  def rss
    perform_request
  end

private

  def perform_request(limit = 5)
    return { status: 400, body: 'HTTP redirect too deep' } if limit == 0

    uri = URI(event['url'])

    if "#{event['method']}".downcase == 'post'
      req = Net::HTTP::Post.new(uri, event)
    else
      req = Net::HTTP::Get.new(uri)
    end

    event['headers'] ||= {}
    event['headers']['User-Agent'] ||= 'Mozilla /5.0 (Compatible MSIE 9.0;Windows NT 6.1;WOW64; Trident/5.0)'

    event['headers'].each do |key, value|
      req[key] = value
    end

    begin
      response = Net::HTTP.start(uri.hostname, uri.port, {
        use_ssl: uri.scheme == 'https',
        open_timeout: TIMEOUT,
        ssl_timeout: TIMEOUT,
        read_timeout: TIMEOUT,
        keep_alive_timeout: TIMEOUT
      }) { |http|
        http.request(req)
      }

      case response
      when Net::HTTPRedirection
        event['url'] = response['location']
        perform_request limit - 1
      else
        {
          status: response.code,
          headers: response.to_hash,
          body: response.body.force_encoding('utf-8')
        }
      end
    rescue => e
      {
        status: 401,
        headers: {},
        body: e.message
      }
    end
  end
end

def lambda_handler(event:, context:)
  FollowAlong.new(event, context).run
end
