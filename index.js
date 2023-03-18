const express = require("express");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const secret = process.env.JWT_SECRET

const app = express();

const {client} = require("./db")
const {apiRouter} = require("./api");

app.use(express.json());
app.use(morgan('dev'));

app.use('/api', apiRouter);

app.get("/", (req,res) =>{
    res.send(`<h1>Welcome to Chase's juicebox api!!</h1>
    <h2>You can make requests to /api!</h2>
    `)
})

client.connect();
app.listen(5432, () =>{
    console.log("We are running on port 3001")
});

