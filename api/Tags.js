const express = require("express");

const {getAllTags} = require("../db")

const tagRouter = express.Router();

tagRouter.get("/", async (req, res)=>{
    const tags = await getAllTags();

    res.send({tags})
})

module.exports = {
    tagRouter
}