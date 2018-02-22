const REQUEST_TYPES = Object.freeze({
  UNKNOWN: 'Unknown',
  TURN_ON: 'TurnOn',
  TURN_OFF: 'TurnOff',
  DISCOVER: 'Discover',
  REPORT_STATE: 'ReportState'
})

const RESPONSE_TYPES = Object.freeze({
  DISCOVER: "Discover.Response",
  TURN_ON: "ON",
  TURN_OFF: "OFF"
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

// Expected response https://developer.amazon.com/docs/device-apis/alexa-discovery.html#discoverresponse
const handleAlexaDiscoverRequest = event => {
  // Use the messageId as an identifier of the device/thing/launcher
  const endpointId = event.directive.header.messageId
  const endpoint = Object.assign({ endpointId }, BASE_ENDPOINT)
  const endpoints = [endpoint]
  const payload = { endpoints }
  const header = Object.assign({}, event.directive.header, { name: RESPONSE_TYPES.DISCOVER })
  return { event: { header, payload } }
}

const handler = (event, context) => {
  
}


exports.REQUEST_TYPES = REQUEST_TYPES
exports.getRequestType = getRequestType
exports.handleAlexaDiscoverRequest = handleAlexaDiscoverRequest
exports.handler = handler
