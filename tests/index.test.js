const lambda = require('../src/index')

// Found in https://developer.amazon.com/docs/device-apis/alexa-powercontroller.html
const events = require('./events.json')
const responses = require('./responses.json')

const {
  getRequestType
} = lambda

test('finds the alexa request type', () => {
  const event = events.turnOn
  const expected = event.directive.header.name
  const actual = getRequestType(event)
  expect(actual).toBe(expected)
})
