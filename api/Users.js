const express = require("express");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");
require('dotenv').config();

const secret = process.env.JWT_SECRET

const {getAllUsers, getUserByUsername, createUser} = require("../db")

// userRouter.use((req, res)=>{
//     console.log("A request made to /users")
//     res.send("this is from userRouter")
// })

userRouter.get("/", async (req, res)=>{
    try {
        const users = await getAllUsers();

        res.send(users);
    } catch (error) {
        console.log(error);
    }
})

userRouter.post("/login", async (req,res,next)=>{
    const { username, password } = req.body;

  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password"
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      // create token & return to user
      res.send({ message: "you're logged in!" ,
      token: jwt.sign(user, secret)
    });
    } else {
      next({ 
        name: 'IncorrectCredentialsError', 
        message: 'Username or password is incorrect'
      });
    }
  } catch(error) {
    console.log(error);
    next(error);
  }
});

userRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;
  
    try {
      const _user = await getUserByUsername(username);
  
      if (_user) {
        next({
          name: 'UserExistsError',
          message: 'A user by that username already exists'
        });
      }
  
      const user = await createUser({
        username,
        password,
        name,
        location,
      });
  
      const token = jwt.sign({ 
        id: user.id, 
        username
      }, secret, {
        expiresIn: '1w'
      });
  
      res.send({ 
        message: "thank you for signing up",
        token
      });
    } catch ({ name, message }) {
      next({ name, message })
    } 
  });

module.exports ={
    userRouter
}