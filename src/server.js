import express from 'express'
import cors from 'cors'
import { MongoClient } from "mongodb";
import dotenv from 'dotenv'


dotenv.config();

const mongoClient = new MongoClient('mongodb://127.0.0.1:27017');

// const mongoClient = new MongoClient(process.env.URL_CONNECT_MONGO);
let db;

mongoClient.connect().then(() => {
    db = mongoClient.db("bate-papo-UOL");
});

const server = express();
server.use(express.json());
server.use(cors());

// server.get('/participants', (req, res) => {

// db.collection("users").findOne({
// 	email: "joao@email.com"
// }).then(user => {
// 	console.log(user); // imprimirá um objeto { "_id": ..., "email": ..., "password": ... } 
// });

//     res.status(200).send('OK')
// })

server.post('/participants', (req, res) => {

    // db.collection("users").insertOne({
// 	email: "joao@email.com",
// 	password: "minha_super_senha"
// });

    res.status(200).send('OK')
    console.log('ok')
})

server.listen(5000)