const Settings = require('./Settings')
const express = require('express')
const amqp = require('amqp-connection-manager')


let connection = amqp.connect(Settings.get('rabbitMQServers', []))
const channelWrapper = connection.createChannel({
	json: true,
	setup: (channel) => {
		return channel.assertQueue(Settings.get('rabbitMQQueueName', 'input'), { durable: true })
	}
})
// ! customize this function
const convertToPagerAlarm = (alertData) => {
    console.log('DEBUG prometheus alert: ', JSON.stringify(alertData))
    return ['2A', 'test']
}

const app = express()

const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 9098,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'
app.use(require('body-parser').json())
app.get('/', (req, res) => res.send('Hello World'))
app.get('/metrics', (req, res) => res.send('Not implemented'))

app.post('/alert', async (req, res) => {
    if (!req.body) return res.sendStatus(400)
    for (alertNumber in req.body.alerts) {
        const data = convertToPagerAlarm(req.body.alerts[alertNumber])
        //await channelWrapper.sendToQueue(Settings.get('rabbitMQQueueName', 'input'), data)
    }
    return res.send('"ok"')
})

app.listen(port, ip)
console.log('Server running on http://%s:%s', ip, port)