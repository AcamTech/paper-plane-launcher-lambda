const mqtt = require('mqtt')

const { SHIFTR_USERNAME, SHIFTR_PASSWORD } = process.env
const HOST = 'broker.shiftr.io'
const CLIENT_ID = 'lambda'
const TOPIC = '/launcher'

const send = value => new Promise((resolve, reject) => {
  var client = mqtt.connect(`mqtt://${SHIFTR_USERNAME}:${SHIFTR_PASSWORD}@${HOST}`, { clientId: CLIENT_ID })
  client.on('error', reject)
  client.on('connect', () => {
    try {
      client.publish(TOPIC, value, error => {
        client.end()
        if (error) {
          reject(error)
        } else {
          resolve(value)
        }
      })
    } catch (error) {
      reject(error)
    }
  })
})

module.exports = { send }
