const express = require("express");
const apiRouter = express.Router();
const jwt = require("jsonwebtoken");
require('dotenv').config();

const secret = process.env.JWT_SECRET

const{getUserById} = require("../db")

const {userRouter} = require("./Users");
const {postRouter} = require("./Posts");
const {tagRouter} = require("./Tags");

apiRouter.use(async (req, res, next) => {
    const prefix = 'Bearer ';
    let auth = "";
    if(req.header("Authorization")){
        auth = req.header('Authorization');
    }
    if(req.header("authorization")){
        auth = req.header("authorization")
    }    
  
    if (!auth) { // nothing to see here
      next();
    } else if (auth.startsWith(prefix)) {
      const token = auth.slice(prefix.length);
  
      try {
        const { id } = jwt.verify(token, secret);
  
        if (id) {
          req.user = await getUserById(id);
          console.log(req.user)
          next();
        }
      } catch ({ name, message }) {
        next({ name, message });
      }
    } else {
      next({
        name: 'AuthorizationHeaderError',
        message: `Authorization token must start with ${ prefix }`
      });
    }
});

apiRouter.use((req, res, next) => {
    if (req.user) {
      console.log("User is set:", req.user.id);
    }
    next();
});



apiRouter.use('/users', userRouter);

apiRouter.use('/posts', postRouter);

apiRouter.use("/tags", tagRouter);

apiRouter.use((error, req, res, next) => {
    res.send({
      name: error.name,
      message: error.message
    });
});

  

module.exports = {
    apiRouter
}