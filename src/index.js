const responseBuilder = require('./responseBuilder')

const handler = (event, context) => {
  const response = responseBuilder.buildResponseToEvent(event)
  context.succeed(response)
}

module.exports = {
  handler
}
