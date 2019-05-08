require 'net/https'
require 'uri'
require 'erb'
require 'cgi'

def perform_proxy_request(url, headers = {})
  url = URI.parse(url)
  req = Net::HTTP::Get.new(url.request_uri)
  http = Net::HTTP.new(url.host, url.port)
  http.use_ssl = url.scheme == "https"
  res = http.request(req)

  # headers: res.to_hash
  res.body.force_encoding("UTF-8")
end

def lambda_handler(event:, context:)
  perform_proxy_request event['url'], event['headers']
end
