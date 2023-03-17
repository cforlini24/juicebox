const express = require("express");
const userRouter = express.Router();
const {getAllUsers} = require("../db")

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

module.exports ={
    userRouter
}