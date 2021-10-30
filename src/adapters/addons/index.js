import AWSLambda from './aws-lambda.js'
import CORSAnywhere from './cors-anywhere.js'
import FollowAlongFree from './followalong-free.js'
import FollowAlongUnlimited from './followalong-unlimited.js'
import Local from './local.js'
import None from './none.js'
import S3 from './s3.js'

export default [
  None,
  Local,
  FollowAlongFree,
  FollowAlongUnlimited,
  CORSAnywhere,
  AWSLambda,
  S3
]
