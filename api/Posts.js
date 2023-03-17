const express = require("express");
const { getAllPosts, createPost } = require("../db");
const {requireUser} = require("./utils.js");

const postRouter = express.Router();

postRouter.get("/", requireUser, async (req, res)=>{
    const posts = await getAllPosts();

    res.send({posts});
})


postRouter.post('/', requireUser, async (req, res, next) => {
    const { title, content, tags = "" } = req.body;
  
    const tagArr = tags.trim().split(/\s+/)
    const postData = {};
  
    // only send the tags if there are some to send
    if (tagArr.length) {
      postData.tags = tagArr;
    }
  
    try {
      // add authorId, title, content to postData object
      postData.title = title;
      postData.content = content;
      postData.authorId = req.user.id;
      const post = await createPost(postData);
      if(post) {
        res.send({post})
      }else {
        next({
            name: "InvalidPostData",
            message: "Please be sure to provide a title and content"
        })
      }

    } catch ({ name, message }) {
      next({ name, message });
    }
});


module.exports = {
    postRouter
}
