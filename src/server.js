import express from 'express'
import cors from 'cors'
import { MongoClient } from "mongodb";
import dotenv from 'dotenv'


dotenv.config();

const mongoClient = new MongoClient(process.env.URL_CONNECT_MONGO);
let db;

mongoClient.connect().then(() => {
    db = mongoClient.db("bate-papo-UOL");
});

const server = express();
server.use(express.json());
server.use(cors());


server.post('/participants', async (req, res) => {

    const { name } = req.body;

    const valid = await db.collection("users").findOne({
        name: 'julius'
    })
    if(valid){
        res.sendStatus(409)
        return
    }

    try {
        db.collection("users").insertOne({
            name: name
        });

        res.status(200).send('OK')
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

server.listen(5000)