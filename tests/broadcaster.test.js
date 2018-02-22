const broadcaster = require('../src/broadcaster')
const { send } = broadcaster

/*
  Modify the test script in the package.json to include the
  environment variables to run this test locally. It should look like
  ...
  "test": "SHIFTR_USERNAME=123abc SHIFTR_PASSWORD=456xyz jest"
  ...
*/
test.skip('sends a message', () => {
  return expect(send('message')).resolves.toBe('message')
})
