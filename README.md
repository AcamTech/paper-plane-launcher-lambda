# Paper Plane Launcher Lambda

Function that handles Alexa's directives to turn on or off an Arduino-controlled Paper Plane Launcher.

You can read more in the following link:
https://developer.amazon.com/docs/smarthome/steps-to-build-a-smart-home-skill.html

# To run tests

1. Make sure you have installed Jest
2. Run `npm test`

# To deploy

1. Make sure you have configured `aws cli`
2. Change the name of the Lambda function in the `deploy` npm script
3. Run `npm run deploy`
