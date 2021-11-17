# frozen_string_literal: true

`zip -r function.zip function.rb lib vendor`
`aws lambda update-function-code --function-name followalong-passthrough --zip-file fileb://function.zip`
