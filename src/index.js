const responseBuilder = require('./responseBuilder')
const broadcaster = require('./broadcaster')

const handler = (event, context) => {
  const response = responseBuilder.buildResponseToEvent(event)
  if (!responseBuilder.isPowerControlRequest(event)) {
    return context.succeed(response)
  }

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
