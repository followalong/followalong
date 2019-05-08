require 'securerandom'
require 'aws-sdk-s3'
require 'openssl'
require 'digest/sha2'
require 'base64'

class Request
  def initialize(event, context)
    @event = event
    @context = context
  end

  def event;   @event;   end
  def context; @context; end

  def bucket
    @bucket ||= begin
      s3 = Aws::S3::Resource.new(region: ENV['region'])
      s3.bucket(ENV['bucket'])
    end
  end

  def secret_key
    @secret_key ||= begin
      prefix = "#{event['client_key']}/"
      found = bucket.objects(prefix: prefix).collect(&:key).reject { |k| k == prefix }
      bucket.object(found[0]) if found.any?
    end
  end

  def decrypt(key = '', content = '')
    alg = 'AES-256-CBC'
    decode_cipher = OpenSSL::Cipher.new(alg)
    decode_cipher.decrypt
    decode_cipher.key = key
    plain = decode_cipher.update(content)
    plain << decode_cipher.final
    plain
  end

  def encrypted_content
    return unless event['content']
    return unless secret_key

    begin
      decrypt secret_key, event['content']
    rescue => e
      nil
    end
  end

  def response
    output = {}

    begin
      if event['content'] && secret_key
        if encrypted_content
          bucket.object([
            event['client_key'],
            secret_key
          ].join('/')).put({
            acl: "private",
            body: encrypted_content
          })
        else
          output[:error] = 'Unauthorized.'
        end
      else
        output[:secret_key] = SecureRandom.hex
        bucket.object([
          event['client_key'],
          output[:secret_key]
        ].join('/')).put({
          acl: "private",
          body: nil
        })
      end
    rescue => e
      output[:error] = e.message
    end

    output
  end
end

def lambda_handler(event:, context:)
  Request.new(event, context).response
end
