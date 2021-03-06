const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require('pusher');
const cors = require('cors');
require('dotenv').config();
const shortId = require('shortid');
const dialogFlow = require('./config');
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    encrypted: true
});

app.get('/', function (req, res) {
    res.status(200).json({
        title: 'Engineer Challenge ',
        route: [{
            method: 'Post',
            url: '/api/message',
            query: null
        }]
    });
});

app.post('/api/message', async (req, res) => {
    // simulate actual db save with id and createdAt added
    console.log(req.body);
    const chat = {
        ...req.body,
        id: shortId.generate(),
        createdAt: new Date().toISOString()
    }
    //update pusher listeners
    pusher.trigger('chat-bot', 'chat', chat);

    const message = chat.message;
    const response = await dialogFlow.send(message, chat.lang);

    console.log(response.data.result.fulfillment.speech);
    // trigger this update to our pushers listeners
    pusher.trigger('chat-bot', 'chat', {
        message: `${response.data.result.fulfillment.speech}`,
        type: 'bot',
        createdAt: new Date().toISOString(),
        id: shortId.generate()
    });
    res.send(chat);
})

app.listen(process.env.PORT || 8080);
