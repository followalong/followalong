require_relative 'lib/runner'

def lambda_handler(event:, context:)
  FollowAlong::Runner.new.run(event['action'], event, context)
end
