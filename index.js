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

client.connect();
app.listen(3001, () =>{
    console.log("We are running on port 3001")
});

