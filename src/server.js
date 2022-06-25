import express from 'express'
import cors from 'cors'
import { MongoClient } from "mongodb";
import joi from 'joi'
import dotenv from 'dotenv'
import dayjs from 'dayjs'


dotenv.config();

const mongoClient = new MongoClient(process.env.URL_CONNECT_MONGO);
let db;

mongoClient.connect().then(() => {
    db = mongoClient.db("bate-papo-UOL");
});

const server = express();
server.use(express.json());
server.use(cors());

async function deletParticipants() {

    const users = await db.collection("users").find().toArray();

    const now = Date.now()

    const time = dayjs().format('HH:MM:ss')

    for (let counter = 0; counter < users.length; counter++) {
        if ((now - (users[counter]).lastStatus) > 10000) {

            let name = (users[counter]).name

            try {
                await db.collection('users').deleteOne(users[counter])

                db.collection("messages").insertOne({
                    from: name,
                    to: 'Todos',
                    text: 'sai da sala...',
                    type: 'status',
                    time
                });
            } catch {
                res.sendStatus(500)
            }
        }
    }
}

// Participantes

server.post('/participants', async (req, res) => {

    const { name } = req.body;

    const time = dayjs().format('HH:MM:ss')

    const userSchema = joi.object({
        name: joi.string().required(),
    });

    const user = { name: name }

    const validation = userSchema.validate(user, { abortEarly: true });

    if (validation.error) {
        console.log(validation.error.details)
        res.sendStatus(422)
        return
    }

    const valid = await db.collection("users").findOne({
        name: name
    })
    if (valid) {
        res.sendStatus(409)
        return
    }

    try {

        db.collection("users").insertOne({
            name: name,
            lastStatus: Date.now()
        });

        db.collection("messages").insertOne({
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time
        });

        res.status(201).send('OK')

        deletParticipants()
        setInterval(deletParticipants, 15000)
    }
    catch {
        res.sendStatus(500)
    }

})

server.get('/participants', async (req, res) => {

    try {
        const users = await db.collection("users").find().toArray();
        res.send(users)
    }
    catch {
        res.sendStatus(500)
    }
})

// Mensagens

server.post('/messages', async (req, res) => {

    const { to, text, type } = req.body;

    const { user } = req.headers

    const time = dayjs().format('HH:MM:ss')

    const userSchema = joi.object({
        to: joi.string().required(),
        text: joi.string().required(),
    });

    const validation = userSchema.validate({
        to: to,
        text: text
    }, { abortEarly: true });

    if (validation.error) {
        console.log(validation.error.details)
        res.sendStatus(422)
        return
    }

    if (type !== 'private_message' && type !== 'message') {
        res.sendStatus(422)
        console.log('erro no tipo')
        return
    }

    const valid = await db.collection("users").findOne({
        name: user
    })
    if (!valid) {
        res.sendStatus(422)
        console.log('erro no usuario')
        return
    }

    try {

        db.collection("messages").insertOne({
            from: user,
            to,
            text,
            type,
            time
        });

        res.sendStatus(201)
    }
    catch {
        res.sendStatus(500)
    }

})


server.get('/messages', async (req, res) => {

    const limit = parseInt(req.query.limit)

    try {
        const messages = await db.collection("messages").find().toArray();

        let limitedMessages = []

        if (limit < messages.length) {
            for (let counter = 0; counter < limit; counter++) {
                limitedMessages.push(messages[(messages.length - 1) - counter])
            }
        }
        else {
            limitedMessages = messages
        }

        res.send(limitedMessages)
    }
    catch {
        res.sendStatus(500)
    }
})

// Status

server.post('/status', async (req, res) => {

    const { user } = req.headers

    const time = Date.now()

    const validName = await db.collection('users').findOne({ name: user })

    if (!validName) {
        res.sendStatus(404)
    }

    try {

        db.collection("users").updateOne({
            name: user
        }, { $set: { lastStatus: time } });

        res.sendStatus(200)
    }
    catch {
        res.sendStatus(500)
    }

})

server.listen(5000)