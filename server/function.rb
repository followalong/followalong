require 'net/https'
require 'uri'
require 'erb'
require 'cgi'
require 'date'
require 'json'
require 'aws-sdk-s3'
require 'stripe'
require 'securerandom'

Stripe.api_key = ENV['stripe_api_key']

class FollowAlong
  TIMEOUT = 5
  ALLOWED_METHODS = %w(rss subscribe).freeze # sync publish search media

  def run(action, data)
    if ALLOWED_METHODS.include? action
      send action, data
    else
      { status: 403, body: 'Unauthorized' }
    end
  end

  private

  # def sync
  #   { body: 'Saved.' }
  # end

  def s3
    @s3 ||= Aws::S3::Resource.new
  end

  def subscribe(data = {})
    metadata = {
      token: SecureRandom.urlsafe_base64(32),
      expiry: (Date.today + 366).to_s,
    }

    accounts = read_accounts
    accounts[metadata[:token]] = metadata[:expiry]
    write_accounts accounts

    Stripe::Charge.create(
      amount: 2900,
      currency: 'usd',
      description: '1-Year Unlimited Access',
      source: data['token'],
      metadata: metadata
    )

    {
      status: 200,
      headers: {},
      body: metadata,
    }
  rescue => e
    {
      status: 401,
      headers: {},
      body: e.message,
    }
  end

  def rss(data = {})
    perform_request data
  end

  def accounts
    @accounts ||= s3.bucket(ENV['aws_bucket']).object 'accounts.json'
  end

  def read_accounts
    JSON.parse accounts.get.body.read
  end

  def write_accounts(data = {})
    accounts.put(
      acl: 'private',
      body: data.to_json
    )
  end

  def perform_request(data = {}, limit = 5)
    return { status: 400, body: 'HTTP redirect too deep' } if limit == 0

    url = data['url']
    url = Base64.decode64 url if url[0..3] != 'http'
    uri = URI url

    req = if data['method'].to_s.downcase == 'post'
            Net::HTTP::Post.new(uri, data)
          else
            Net::HTTP::Get.new(uri)
          end

    data['headers'] ||= {}
    data['headers']['User-Agent'] ||= 'Mozilla /5.0 (Compatible MSIE 9.0;Windows NT 6.1;WOW64; Trident/5.0)'

    data['headers'].each do |key, value|
      req[key] = value
    end

    response = Net::HTTP.start(uri.hostname, uri.port,
      use_ssl: uri.scheme == 'https',
      open_timeout: TIMEOUT,
      ssl_timeout: TIMEOUT,
      read_timeout: TIMEOUT,
      keep_alive_timeout: TIMEOUT
    ) do |http|
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
        body: response.body.force_encoding('utf-8'),
      }
    end
  rescue => e
    {
      status: 401,
      headers: {},
      body: e.message,
    }
  end
end

def lambda_handler(event:)
  FollowAlong.new.run(event['action'], event)
end
