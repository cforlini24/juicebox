const express = require("express");
const { getAllPosts } = require("../db");

const postRouter = express.Router();

postRouter.get("/", async (req, res)=>{
    const posts = await getAllPosts();

    res.send({posts});
})

module.exports = {
    postRouter
}
