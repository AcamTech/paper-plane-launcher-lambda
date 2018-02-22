const lambda = require('../src/index')

// Found in https://developer.amazon.com/docs/device-apis/alexa-powercontroller.html
const events = require('./events.json')
const responses = require('./responses.json')

const {
  REQUEST_TYPES,
  getRequestType,
  handleAlexaDiscoverRequest
} = lambda

const {
  UNKNOWN,
  TURN_ON
} = REQUEST_TYPES

describe('getRequestType', () => {
  test('finds the alexa request type', () => {
    const event = events.turnOn
    const expected = TURN_ON
    const actual = getRequestType(event)
    expect(actual).toBe(expected)
  })

  test('returns unknown request type', () => {
    const event = {}
    const expected = UNKNOWN
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
