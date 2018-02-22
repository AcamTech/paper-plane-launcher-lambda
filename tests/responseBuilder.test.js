const responseBuilder = require('../src/responseBuilder')

// Found in https://developer.amazon.com/docs/device-apis/alexa-powercontroller.html
const events = require('./events.json')
const responses = require('./responses.json')

const {
  getRequestType,
  getPowerValue,
  isPowerControlRequest,
  buildDiscoveryResponse,
  buildErrorResponse,
  buildControlResponse,
  buildResponseToEvent
} = responseBuilder

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

describe('getPowerValue', () => {
  test('gets ON/OFF', () => {
    let actual = getPowerValue(events.turnOn)
    let expected = 'ON'
    expect(actual).toBe(expected)
    actual = getPowerValue(events.turnOff)
    expected = 'OFF'
    expect(actual).toBe(expected)
  })

  test('gets undefined for non-power-control requests', () => {
    const actual = getPowerValue(events.discover)
    expect(actual).toBeUndefined()
  })
})

describe('isPowerControlRequest', () => {
  test('returns true', () => {
    const expected = true
    let actual = isPowerControlRequest(events.turnOn)
    expect(actual).toBe(expected)
    actual = isPowerControlRequest(events.turnOff)
    expect(actual).toBe(expected)
  })

  test('returns false', () => {
    const expected = false
    let actual = isPowerControlRequest(events.discover)
    expect(actual).toBe(expected)
    actual = isPowerControlRequest(events.reportState)
    expect(actual).toBe(expected)
  })
})

describe('buildDiscoveryResponse', () => {
  const event = events.discover
  const response = buildDiscoveryResponse(event)

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
  const message = 'Error message'
  const error = new Error(message)
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

  test('handles non-alexa-event', () => {
    const event = {}
    const actual = buildErrorResponse(event, type, error)
    const expected = { event: { header: {}, endpoint: {}, payload: { type, message } } }
    expect(actual).toEqual(expected)
  })
})

describe('buildControlResponse', () => {
  const event = events.turnOn
  const value = 'turnOn'
  const response = buildControlResponse(event, value)
  const { header, endpoint, payload } = response.event
  const { properties } = response.context

  test('header.namespace to be "Alexa" and header.name to be "Response"', () => {
    let expected = 'Response'
    let actual = header.name
    expect(actual).toBe(expected)
    expected = 'Alexa'
    actual = header.namespace
    expect(actual).toBe(expected)
  })

  test('response.endpoint to be directive.endpoint', () => {
    const expected = event.directive.endpoint
    const actual = endpoint
    expect(actual).toEqual(expected)
  })

  test('context.properties contains powerState and connectivity properties', () => {
    const powerProperty = properties.find(({ namespace }) => namespace == 'Alexa.PowerController')
    const healthProperty = properties.find(({ namespace }) => namespace == 'Alexa.EndpointHealth')
    let actual = powerProperty.value
    let expected = value
    expect(actual).toBe(expected)
    actual = healthProperty.value.value
    expected = 'OK'
    expect(actual).toBe(expected)
  })
})

describe('buildResponseToEvent', () => {
  test('calls buildDiscoveryResponse', () => {
    const event = events.discover
    const actual = buildResponseToEvent(event)
    const expected = buildDiscoveryResponse(event)
    expect(actual).toEqual(expected)
  })

  test('builds a controlResponse to a reportState request', () => {
    // I couldn't get jest.spyOn(responseBuilder, 'buildControlResponse') to work
    // so I had to test it manually
    const event = events.reportState
    const actualResponse = buildResponseToEvent(event)
    const actualProperty = actualResponse.context.properties.find(({name}) => name == 'powerState')
    const actual = actualProperty.value
    const expectedResponse = buildControlResponse(event, 'OFF')
    const expectedProperty = expectedResponse.context.properties.find(({name}) => name == 'powerState')
    const expected = expectedProperty.value
    expect(actual).toEqual(expected)
  })

  test('builds controlResponse to turnOn request', () => {
    // I couldn't get jest.spyOn(responseBuilder, 'buildControlResponse') to work
    // so I had to test it manually
    const event = events.turnOn
    const actualResponse = buildResponseToEvent(event)
    const actualProperty = actualResponse.context.properties.find(({name}) => name == 'powerState')
    const actual = actualProperty.value
    const expectedResponse = buildControlResponse(event, 'ON')
    const expectedProperty = expectedResponse.context.properties.find(({name}) => name == 'powerState')
    const expected = expectedProperty.value
    expect(actual).toEqual(expected)
  })

  test('builds controlResponse to turnOff request', () => {
    // I couldn't get jest.spyOn(responseBuilder, 'buildControlResponse') to work
    // so I had to test it manually
    const event = events.turnOff
    const actualResponse = buildResponseToEvent(event)
    const actualProperty = actualResponse.context.properties.find(({name}) => name == 'powerState')
    const actual = actualProperty.value
    const expectedResponse = buildControlResponse(event, 'OFF')
    const expectedProperty = expectedResponse.context.properties.find(({name}) => name == 'powerState')
    const expected = expectedProperty.value
    expect(actual).toEqual(expected)
  })
})
