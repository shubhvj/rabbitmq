const express = require('express')
const amqp = require('amqplib')

const app = express()
const amqpURL = 'amqp://localhost:5672'
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

app.post('/', async (req, res) => {
    console.log(req.body);
    const data = req.body
    const amqpConnection = await amqp.connect(amqpURL)
    const channel = await amqpConnection.createChannel()
    await channel.assertQueue("orderQueue")
    channel.sendToQueue('orderQueue', Buffer.from(JSON.stringify(data)))
    res.send('Orders API')
})

app.listen(8000, () => {
    console.log("Orders API is up");
})