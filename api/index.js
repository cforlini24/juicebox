const express = require("express");
const apiRouter = express.Router();


const {userRouter} = require("./Users");
const {postRouter} = require("./Posts");
const {tagRouter} = require("./Tags");

apiRouter.use('/users', userRouter);

apiRouter.use('/posts', postRouter);

apiRouter.use("/tags", tagRouter);

module.exports = {
    apiRouter
}