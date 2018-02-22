const REQUEST_TYPES = Object.freeze({
  UNKNOWN: 'Unknown',
  TURN_ON: 'TurnOn',
  TURN_OFF: 'TurnOff',
  DISCOVER: 'Discover',
  REPORT_STATE: 'ReportState'
})

const RESPONSE_TYPES = Object.freeze({
  DISCOVER: "Discover.Response",
  ERROR: "ErrorResponse"
})

const ERROR_TYPES = Object.freeze({
  INTERNAL_ERROR: "INTERNAL_ERROR",
  INVALID_DIRECTIVE: "INVALID_DIRECTIVE"
})

const CAPABILITIES = Object.freeze([
  {
    "type": "AlexaInterface",
    "interface": "Alexa",
    "version": "3"
  },
  {
    "interface": "Alexa.PowerController",
    "version": "3",
    "type": "AlexaInterface",
    "properties": {
      "supported": [{
        "name": "powerState"
      }],
       "retrievable": true
    }
  }
])

const BASE_ENDPOINT = Object.freeze({
  "manufacturerName": "Arduino",
  "friendlyName": "Paper Plane Launcher",
  "description": "Launcher of planes made of paper",
  "displayCategories": ["SWITCH"],
  capabilities: CAPABILITIES
})

const getRequestType = event => {
  try {
    return event.directive.header.name
  } catch (error) {
    return REQUEST_TYPES.UNKNOWN
  }
}

// Expected response https://developer.amazon.com/docs/device-apis/alexa-errorresponse.html
const buildErrorResponse = (event, type, error) => {
  const requestType = getRequestType(event)
  let response = {
    event: { header: {}, endpoint: {}, payload: { type, message: error.message } }
  }
  if (requestType != REQUEST_TYPES.UNKNOWN) {
    response = {
      event: {
        header: Object.assign({}, event.directive.header, { name: RESPONSE_TYPES.ERROR, namespace: 'Alexa' }),
        endpoint: { endpointId: event.directive.header.messageId },
        payload: {
          type,
          message: error.message
        }
      }
    }
  }

  return response
}

// Expected response https://developer.amazon.com/docs/device-apis/alexa-powercontroller.html
const buildControlResponse = (event, value) => {
  const timeOfSample = new Date().toISOString()
  const uncertaintyInMilliseconds = 500
  const response = {
    "event": {
      "header": Object.assign({}, event.directive.header, { namespace: 'Alexa', name: 'Response' }),
      "endpoint": event.directive.endpoint,
      "payload": {}
    },
    "context": {
      "properties": [
        {
          "namespace": "Alexa.PowerController",
          "name": "powerState",
          value,
          timeOfSample,
          uncertaintyInMilliseconds
        },
        {
          "namespace": "Alexa.EndpointHealth",
          "name": "connectivity",
          "value": {
            "value": "OK"
          },
          timeOfSample,
          uncertaintyInMilliseconds
        }
      ]
    }
  }
  return response
}

// Expected response https://developer.amazon.com/docs/device-apis/alexa-discovery.html#discoverresponse
const buildDiscoveryResponse = event => {
  // Use the messageId as an identifier of the device/thing/launcher
  const endpointId = event.directive.header.messageId
  const endpoint = Object.assign({ endpointId }, BASE_ENDPOINT)
  const endpoints = [endpoint]
  const payload = { endpoints }
  const header = Object.assign({}, event.directive.header, { name: RESPONSE_TYPES.DISCOVER })
  return { event: { header, payload } }
}

const buildResponseToEvent = event => {
  let response
  try {
    const requestType = getRequestType(event)
    switch (requestType) {
      case REQUEST_TYPES.DISCOVER:
        response = buildDiscoveryResponse(event)
        break
      case REQUEST_TYPES.REPORT_STATE:
        // Say it's off everytime Alexa asks.
        // We can query the launcher later to give a real state
        // Problably we should say "retrievable: false" in the discovery response
        response = buildControlResponse(event, 'OFF')
        break
      case REQUEST_TYPES.TURN_ON:
      case REQUEST_TYPES.TURN_OFF:
        const value = requestType.replace('Turn', '').toUpperCase()
        response = buildControlResponse(event, value)
        break
      case REQUEST_TYPES.UNKNOWN:
      default:
        const error = new Error('Directive is not valid for this skill or is malformed')
        response = buildErrorResponse(event, ERROR_TYPES.INVALID_DIRECTIVE, error)
    }
  } catch (error) {
    console.error(error);
    // Succeed to lambda but tell alexa that we failed
    response = buildErrorResponse(event, ERROR_TYPES.INTERNAL_ERROR, error)
  }
  return response
}

module.exports = {
  getRequestType,
  buildResponseToEvent,
  buildErrorResponse,
  buildControlResponse,
  buildDiscoveryResponse
}
