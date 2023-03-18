const express = require("express");

const {getAllTags ,getPostsByTagName} = require("../db")

const tagRouter = express.Router();

tagRouter.get("/", async (req, res)=>{
    const tags = await getAllTags();

    res.send({tags})
})

tagRouter.get("/:tagName/posts", async (req,res,next)=>{
    const tagName = req.params.tagName;

    try {
        const allPosts = await getPostsByTagName(tagName);
        
        const posts = allPosts.filter((post) =>{
            return post.active || (req.user && post.author.id == req.user.id)
          })

        res.send({posts})
    } catch (error) {
        next(error);
    }
})

module.exports = {
    tagRouter
}