require 'stripe'
require 'aws-sdk-s3'
require 'securerandom'
require 'json'
require 'date'

module FollowAlong
  class Subscribe
    def perform(data = {})
      ::Stripe.api_key = ENV['stripe_api_key']

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

    private

    def s3
      @s3 ||= Aws::S3::Resource.new
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
  end
end
