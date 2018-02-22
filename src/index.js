const REQUEST_TYPES = Object.freeze({
  UNKNOWN: 'Unknown',
  TURN_ON: 'TurnOn',
  TURN_OFF: 'TurnOff',
  DISCOVER: 'Discover',
  REPORT_STATE: 'ReportState'
})
exports.REQUEST_TYPES = REQUEST_TYPES

exports.getRequestType = event => {
  try {
    return event.directive.header.name
  } catch (error) {
    return REQUEST_TYPES.UNKNOWN
  }
}

exports.handler = (event, context) => {

}
