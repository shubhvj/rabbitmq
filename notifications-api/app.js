const express = require('express')
const amqp = require('amqplib')
const app = express()
const amqpURL = 'amqp://localhost:5672'
const ws = require('ws')
const http = require('http')
const server = http.createServer(app)
const wss = new ws.Server({ server })
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')))
let clients = []

wss.on('connection', async (ws) => {
    clients.push(ws)
    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    });
})

const connect = async () => {
    try {
        const amqpConnection = await amqp.connect(amqpURL);
        const channel = await amqpConnection.createChannel();

        const queue = 'orderQueue';
        await channel.assertQueue(queue, {
            durable: true
        });

        channel.consume(queue, async (message) => {
            if (message !== null) {
                const data = message.content.toString();
                clients.forEach(client => {
                    if (client.readyState === ws.OPEN) {
                        client.send(data);
                    }
                });

                channel.ack(message);
            }
        });
    } catch (error) {
        console.error('Error connecting to RabbitMQ', error);
    }
};


connect()

server.listen(8001, () => {
    console.log("Notifications API is up");
})