const responseBuilder = require('./responseBuilder')
const broadcaster = require('./broadcaster')

const handler = (event, context) => {
  const response = responseBuilder.buildResponseToEvent(event)
  if (!responseBuilder.isPowerControlRequest(event)) {
    // Reply to Alexa if we don't need to communicate with the Arduino
    return context.succeed(response)
  }

  // Send a message to the Arduino indicating what the user wants to do
  // and then tell Alexa everything is ok.
  const value = responseBuilder.getPowerValue(event)
  broadcaster.send(value)
    .then(() => context.succeed(response))
    .catch(error => {
      const type = responseBuilder.ERROR_TYPES.INTERNAL_ERROR
      const response = responseBuilder.buildErrorResponse(event, type, error)
      context.succeed(response)
    })
}

module.exports = {
  handler
}
