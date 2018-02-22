const lambda = require('../src/index')

// Found in https://developer.amazon.com/docs/device-apis/alexa-powercontroller.html
const events = require('./events.json')
const responses = require('./responses.json')

const {
  getRequestType,
  handleAlexaDiscoverRequest,
  buildErrorResponse
} = lambda

describe('getRequestType', () => {
  test('finds the alexa request type', () => {
    const event = events.turnOn
    const expected = 'TurnOn'
    const actual = getRequestType(event)
    expect(actual).toBe(expected)
  })

  test('returns unknown request type', () => {
    const event = {}
    const expected = 'Unknown'
    const actual = getRequestType(event)
    expect(actual).toBe(expected)
  })
})

describe('handleAlexaDiscoverRequest', () => {
  const event = events.discover
  const response = handleAlexaDiscoverRequest(event)

  test('event.header.name to be "Discover.Response"', () => {
    const expected = 'Discover.Response'
    const actual = response.event.header.name
    expect(actual).toBe(expected)
  })

  describe('endpoint', () => {
    const endpoint = response.event.payload.endpoints[0]
    test('endpointId to be messageId', () => {
      const expected = event.directive.header.messageId
      const actual = endpoint.endpointId
      expect(actual).toBe(expected)
    })

    test('displayCategories contains "SWITCH"', () => {
      const actual = endpoint.displayCategories
      const expected = ['SWITCH']
      expect(actual).toEqual(expected)
    })

    test('capabilities contains interface "Alexa" and "Alexa.PowerController"', () => {
      const { capabilities } = endpoint
      const actual = capabilities.map(({ interface }) => interface).sort()
      const expected = ['Alexa', 'Alexa.PowerController'].sort()
      expect(actual).toEqual(expected)
    })
  })
})

describe('buildErrorResponse', () => {
  const event = events.discover
  const type = 'MyType'
  const error = new Error('Error message')
  const response = buildErrorResponse(event, type, error)
  const { header, endpoint, payload } = response.event

  test('header.namespace to be "Alexa" and header.name to be "ErrorResponse"', () => {
    let expected = 'ErrorResponse'
    let actual = header.name
    expect(actual).toBe(expected)
    expected = 'Alexa'
    actual = header.namespace
    expect(actual).toBe(expected)
  })

  test('endpointId to be messageId', () => {
    const expected = event.directive.header.messageId
    const actual = endpoint.endpointId
    expect(actual).toBe(expected)
  })

  test('payload.type to be "MyType" and payload.message to be error.message', () => {
    let expected = type
    let actual = payload.type
    expect(actual).toBe(expected)
    expected = error.message
    actual = payload.message
    expect(actual).toBe(expected)
  })
})
