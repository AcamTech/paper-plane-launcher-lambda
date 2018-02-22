const lambda = require('../src/index')

// Found in https://developer.amazon.com/docs/device-apis/alexa-powercontroller.html
const events = require('./events.json')
const responses = require('./responses.json')

const {
  getRequestType,
  REQUEST_TYPES
} = lambda

const {
  UNKNOWN,
  TURN_ON
} = REQUEST_TYPES

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
