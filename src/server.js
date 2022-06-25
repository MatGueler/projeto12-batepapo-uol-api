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
server.get('/messages', async (req, res) => {

    try {
        const messages = await db.collection("messages").find().toArray();
        res.send(messages)
    }
    catch {
        res.sendStatus(500)
    }
})

server.listen(5000)